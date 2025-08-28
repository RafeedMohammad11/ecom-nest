# System Design: E-commerce Order and Inventory Management System

## 1. Architectural Overview

This project is built as a **microservices architecture** to handle a high volume of e-commerce traffic. Each service has a single responsibility, which allows for independent scaling, better fault isolation, and clearer separation of concerns.

The services communicate asynchronously via a **Redis message broker**. A single **API Gateway** serves as the entry point for all client requests.

### Architectural Diagram

_Briefly explain the flow of data shown in the diagram._

## 2. Service Communication & Data Consistency

**Problem:** In a distributed system, ensuring data consistency (e.g., matching inventory counts with orders) is a major challenge, especially during periods of high concurrency.

**Solution:** We use a **message broker (Redis)** as a central point for all inter-service communication. All transactions are handled in an event-driven manner.

- `api-gateway` &rarr; `order-service`: The gateway sends a `create_order` message.
- `order-service` &rarr; `inventory-service` & `payment-service`: The `order-service` publishes an `OrderCreated` event to which other services subscribe.

### Handling High-Concurrency & the "Hot Product" Case Study

**Problem:** For a limited-stock "hot product," a classic race condition can occur, where multiple simultaneous purchases could lead to a negative stock count.

**Solution:** The `InventoryService` uses a **Redis List as a transactional queue**.

1.  The `OrderService` pushes an inventory update request onto a dedicated Redis list.
2.  The `InventoryService` contains a worker that uses the `BLPOP` (blocking pop) command to process these requests sequentially and atomically.
3.  This ensures that only one inventory decrement operation is performed at a time for a given product, guaranteeing a consistent and non-negative stock count.

## 3. Technology Stack

- **Framework:** Nest.js
- **Message Broker & Caching:** Redis
- **Database:** (Placeholder: Choose a database like MongoDB or PostgreSQL)
- **Load Testing:** Artillery/k6 to simulate high-concurrency traffic.

## 4. Scalability Strategy

Each microservice can be scaled independently based on its workload. For example, if the `InventoryService` is under heavy load, we can deploy multiple instances of it, all listening to the same Redis list. This allows the system to remain responsive and resilient without having to scale the entire application.

---

### `README.md` Template

This file will serve as an introduction for anyone who wants to run your project or understand what it does.

````markdown
# E-commerce Microservices Project

This project demonstrates a scalable and resilient e-commerce backend system built with **Nest.js** and a **microservices architecture**.

The primary goal of this project is to showcase key backend development and system design principles, including:

- **Event-Driven Architecture:** Asynchronous communication between services using a Redis message broker.
- **Microservices:** Clear separation of concerns into individual, independently scalable services.
- **Concurrency & Race Condition Handling:** A robust solution for managing high-volume, limited-stock item sales.
- **Redis Caching:** Utilization of Redis for both caching and a transactional task queue.
- **SOLID Principles:** Clean, modular, and testable code design.

## Features

- **Order Processing:** A service dedicated to creating and managing customer orders.
- **Inventory Management:** A service that listens for new orders and updates stock. Includes a special concurrency solution for "hot products."
- **Simulated Payment & Notifications:** Placeholder services to demonstrate a complete system workflow.

## Running the Project

1.  **Prerequisites:**
    - Node.js (v18+)
    - npm (v9+)
    - A running Redis instance (e.g., via Docker).
2.  **Installation:**
    ```bash
    git clone <your-repository-url>
    cd e-commerce-monorepo
    npm install
    ```
3.  **Running Services:**
    ```bash
    # To run all services concurrently
    npm run start:dev
    # Or start individual services:
    npm run start:dev api-gateway
    npm run start:dev order-service
    # etc...
    ```

## Performance & System Design

To prove the system's ability to handle scale, we performed a load test using **Artillery**. The results demonstrate that the system maintains low latency and a consistent, non-negative stock count even with thousands of concurrent requests.

**Load Test Results:**

- **Requests per second (RPS):**
- **Average Latency:**
- **Success Rate:**

_For a detailed breakdown of the system's design, architecture, and the solutions to concurrency challenges, please see the **SYSTEM_DESIGN.md** file._
````
