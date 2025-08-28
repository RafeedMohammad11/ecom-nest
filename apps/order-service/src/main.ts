import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { OrderServiceModule } from './order-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(OrderServiceModule, {
    transport: Transport.REDIS,
    options: {
      host: 'localhost',
      port: 6379
    }
  });
  await app.listen();
}
bootstrap();
