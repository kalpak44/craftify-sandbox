# Craftify API

Craftify API is a sandbox API for crafting products from other products. This API is built with Spring Boot and uses
MongoDB as the database.

## Getting Started

### Prerequisites

- Java 17 or later
- Maven
- MongoDB

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/kalpak44/craftify-sandbox.git
cd craftify
```

2. **Set up MongoDB:**
   Ensure MongoDB is running and configure the connection details in `application.yaml` or via environment variables:
```yaml
spring:
  data:
    mongodb:
      uri: mongodb://${MONGO_HOST:localhost}:${MONGO_PORT:27017}/${MONGO_DATABASE:craftify}
      username: ${MONGO_USERNAME:craftify}
      password: ${MONGO_PASSWORD:craftify}
```

3. **Build and run the application:**
```bash
mvn clean install
mvn spring-boot:run
```

### Configuration

The application configuration is managed through `application.yaml`. Below is a brief explanation of the key
configurations:

- **Server Settings:**
    - `server.port`: The port on which the application runs (default: 8080).
    - `server.shutdown`: Enable graceful shutdown.
    - `server.compression`: HTTP response compression settings.

- **MongoDB Settings:**
    - `spring.data.mongodb.uri`: MongoDB connection URI.
    - `spring.data.mongodb.username`: MongoDB username.
    - `spring.data.mongodb.password`: MongoDB password.

- **Springdoc Settings:**
    - `springdoc.api-docs.path`: Path for API documentation.
    - `springdoc.swagger-ui.path`: Path for Swagger UI.

### API Documentation

The API documentation is available at `/v3/api-docs` and the Swagger UI can be accessed at `/swagger-ui`.

### License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

### Contact

For any questions or inquiries, please contact the Craftify Dev Team at [dev@craftify.com](mailto:dev@craftify.com).

