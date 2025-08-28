export class CreateOrderDto {
  userId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}

export class OrderCreatedEvent {
  orderId: string;
  userId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}