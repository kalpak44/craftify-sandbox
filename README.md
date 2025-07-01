# Craftify API

The project is split into two main components:

- **Backend**: Spring Boot API with MongoDB database
- **Frontend**: React Vite application

## Project Structure

```
craftify-sandbox/
├── craftify-app/          # Frontend React application
│   ├── README.md         # Frontend setup instructions
│   └── ...
├── src/                  # Backend Spring Boot application
├── pom.xml              # Maven configuration
└── README.md            # This file (Backend setup)
```

## Frontend Setup

For frontend setup instructions, see the [craftify-app](./craftify-app/README.md).

## Backend Setup

### Prerequisites

- **Java 17 or later**
- **Maven 3.6+**
- **Docker** (for MongoDB and optional Kubernetes)
- **MongoDB** (via Docker, local installation, or MongoDB Atlas)
- **Kubernetes** (optional, for job execution features)
- **Auth0 Account** (for authentication)

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/kalpak44/craftify-sandbox.git
cd craftify-sandbox
```

2. **Set up MongoDB:**

   - **Run MongoDB in Docker (Recommended):**
     ```bash
     docker run -d \
       --name mongodb \
       -p 27017:27017 \
       -e MONGO_INITDB_ROOT_USERNAME=admin \
       -e MONGO_INITDB_ROOT_PASSWORD=password \
       -v mongodb_data:/data/db \
       mongo:latest
     # Connection string for Docker setup:
     # mongodb://admin:password@localhost:27017/craftify?authSource=admin
     ```


   - **Use MongoDB Atlas (Cloud):**
     - Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
     - Create a new cluster
     - Get your connection string

   **MongoDB Database Viewer Recommendations:**
   - **MongoDB Compass** (Official GUI): [Download here](https://www.mongodb.com/try/download/compass)
   - **Studio 3T** (formerly RoboMongo): [Download here](https://studio3t.com/)
   - **MongoDB for VS Code** extension
   - **DBeaver** with MongoDB plugin

3. **Configure MongoDB Connection:**

   Create `src/main/resources/application-local.yaml`:
   ```yaml
   spring:
     data:
       mongodb:
         # For Docker setup:
         uri: mongodb://admin:password@localhost:27017/craftify?authSource=admin
         # For MongoDB Atlas:
         # uri: mongodb+srv://username:password@cluster.mongodb.net/craftify
   ```

4. **Set up Auth0:**

   - Create an Auth0 account at [auth0.com](https://auth0.com)
   - Create a new application (Single Page Application)
   - Create a new API
   - Configure the following in your Auth0 dashboard:
     - **Allowed Callback URLs**: `http://localhost:5173/callback`
     - **Allowed Logout URLs**: `http://localhost:5173`
     - **Allowed Web Origins**: `http://localhost:5173`

   Update `src/main/resources/application-*.yaml`:
   ```yaml
   okta:
     oauth2:
       issuer: https://YOUR_AUTH0_DOMAIN/
       audience: https://YOUR_API_IDENTIFIER/
   ```

5. **Set up Kubernetes (Optional):**

   - **Enable Kubernetes in Docker Desktop (Recommended):**
     ```bash
     # 1. Install Docker Desktop
     # Download from: https://www.docker.com/products/docker-desktop
     # 2. Enable Kubernetes in Docker Desktop
     # Open Docker Desktop → Settings → Kubernetes → Enable Kubernetes
     # 3. Verify Kubernetes is running
     kubectl cluster-info
     kubectl get nodes
     ```

   - **Use Minikube:**
     ```bash
     brew install minikube  # macOS
     # Or download from: https://minikube.sigs.k8s.io/docs/start/
     minikube start
     kubectl cluster-info
     ```

   - **Use Kind (Kubernetes in Docker):**
     ```bash
     brew install kind  # macOS
     # Or download from: https://kind.sigs.k8s.io/docs/user/quick-start/
     kind create cluster
     kubectl cluster-info
     ```

   **Kubernetes Debugging & Management Tools:**
   - [kubectl](https://kubernetes.io/docs/reference/kubectl/) - Official Kubernetes CLI for managing and debugging clusters
   - [k9s](https://k9scli.io/) - Terminal UI to interact with your Kubernetes clusters

6. **Build and run the application:**

   - **Prerequisite: Ensure Java 17+ and Maven are installed**
     ```bash
     java -version   # Should output version 17 or higher
     mvn -version    # Should output Maven version 3.6 or higher
     ```

   - **Build the project:**
     ```bash
     mvn clean install
     ```

   - **Run with development profile:**
     ```bash
     mvn spring-boot:run -Dspring-boot.run.profiles=dev
     ```

   - **Set environment variables (if needed):**
     ```bash
     export MONGO_CONNECTION_STRING="your-mongodb-connection-string"
     export OPENAI_API_KEY="your-openai-api-key"
     export AUTH0_ISSUER="your-auth0-domain"
     export AUTH0_AUDIENCE="your-auth0-api-identifier"
     ```

   - The application will start on [http://localhost:8080](http://localhost:8080) by default.
   - After the application starts, API documentation is available at [http://localhost:8080/swagger-ui](http://localhost:8080/swagger-ui)

**Note:**
- The `OPENAI_API_KEY` environment variable is only required for playground features (AI-powered functionality). It is optional for most users and can be omitted if you do not plan to use these features.
- For development and testing, you can use the following Auth0 developer configuration:
  ```yaml
  issuer: https://dev-f5ge1-8v.us.auth0.com/
  audience: https://app.craftify.com/
  ```