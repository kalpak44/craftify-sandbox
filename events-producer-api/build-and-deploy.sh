#!/bin/bash

set -euo pipefail

DOCKER_USER=kalpak44
APP_NAME=events-producer-api
IMAGE_TAG=latest
IMAGE_NAME=${DOCKER_USER}/${APP_NAME}:${IMAGE_TAG}
NAMESPACE=craftify

echo "🔧 Building Docker image..."
docker build -t $IMAGE_NAME .

echo "📤 Pushing image to Docker Hub..."
docker push $IMAGE_NAME

echo "🚀 Creating namespace if missing..."
kubectl get namespace $NAMESPACE >/dev/null 2>&1 || kubectl create namespace $NAMESPACE

echo "🚀 Deploying to Kubernetes (namespace: $NAMESPACE, single replica)..."
kubectl apply -n $NAMESPACE -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: $APP_NAME
  namespace: $NAMESPACE
spec:
  replicas: 1
  selector:
    matchLabels:
      app: $APP_NAME
  template:
    metadata:
      labels:
        app: $APP_NAME
    spec:
      containers:
        - name: $APP_NAME
          image: $IMAGE_NAME
          imagePullPolicy: Always
          ports:
            - containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: $APP_NAME
  namespace: $NAMESPACE
spec:
  selector:
    app: $APP_NAME
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
EOF

echo "✅ Done. Use 'kubectl get pods,svc -n $NAMESPACE' to check status."