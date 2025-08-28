import { Controller, Get, Logger } from '@nestjs/common';
import { InventoryServiceService } from './inventory-service.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppController } from 'apps/e-commerce-monorepo/src/app.controller';
import Redis from 'ioredis';

@Controller()
export class InventoryServiceController {
  private readonly logger = new Logger(AppController.name);
  private readonly redisClient: Redis;
  private readonly INVENTORY_QUEUE = 'inventory_updates';
  private readonly PRODUCT_STOCK_KEY = 'product:stock:';
  constructor(
    private readonly inventoryServiceService: InventoryServiceService,
  ) {
    this.redisClient = new Redis({
      host: 'localhost',
      port: 6379
    })

    //initialize stock for a "hot product"
    this.redisClient.set(this.PRODUCT_STOCK_KEY + 'hot-product-123', 10);

    //start the worker process on a separate thread
    this.startInventoryWorker()
  }

  // RPC endpoint to check stock from the API Gateway
  @MessagePattern('get_stock')
  async getStock(@Payload() productId: string): Promise<number> {
    const stock = await this.redisClient.get(this.PRODUCT_STOCK_KEY + productId) ?? '0';
    return parseInt(stock, 10) || 0;
  }

  // The consumer for order events
  @MessagePattern('decrement_stock')
  async handleDecrementStock(@Payload() data: { productId: string; quantity: number }) {
    this.logger.log(`Received request to decrement stock for: ${data.productId}`);
    // Push the request to the Redis list (the queue)
    await this.redisClient.lpush(this.INVENTORY_QUEUE, JSON.stringify(data));
  }

  private async startInventoryWorker() {
    this.logger.log('Starting Redis List Worker...');
    while (true) {
      // Blocking pop from the inventory queue
      const result = await this.redisClient.brpop(this.INVENTORY_QUEUE, 0); // 0 means wait indefinitely
      if (result) {
        const [listName, rawData] = result;
        const data = JSON.parse(rawData);

        this.logger.log(`Processing update for product ${data.productId}.`);

        const currentStock = await this.redisClient.get(this.PRODUCT_STOCK_KEY + data.productId) ?? '0';
        const newStock = (parseInt(currentStock, 10) || 0) - data.quantity;

        if (newStock >= 0) {
          // Atomically update stock
          await this.redisClient.set(this.PRODUCT_STOCK_KEY + data.productId, newStock);
          this.logger.log(`Successfully updated stock for ${data.productId}. New stock: ${newStock}`);
          // Here, you would send an event to the PaymentService and NotificationService
        } else {
          // Stock is insufficient, return a failure or handle it
          this.logger.warn(`Failed to update stock for ${data.productId}. Insufficient stock.`);
        }
      }
    }
  }
}
