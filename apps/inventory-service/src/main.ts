import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { InventoryServiceModule } from './inventory-service.module';


async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(InventoryServiceModule, {
    transport: Transport.REDIS,
    options: {
      host: 'localhost',
      port: 6379,
    },
  });
  await app.listen();
}
bootstrap();
