import { BadRequestException, Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';
import { CreateOrderDto } from '../libs/shared-events/src/order.dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('ORDER_SERVICE') private readonly orderClient: ClientProxy,
    @Inject('INVENTORY_SERVICE') private readonly inventoryClient: ClientProxy
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('products/:id/stock')
  async getProductStock(@Param('id') id: string){
    //check stock via RPC beore adding to cart
    const stock = await this.inventoryClient.send('get_stock', id).toPromise();
    return {stock};
  }

  @Post('orders')
  async createOrder(@Body() createOrderDto: CreateOrderDto){
    const orderCreated = await this.orderClient.send('create_order', createOrderDto);

    if(!orderCreated)
    {
      throw new BadRequestException('Order could not be created');
    }

    return orderCreated;
  }
}
