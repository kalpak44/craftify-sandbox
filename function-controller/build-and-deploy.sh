#!/bin/bash

set -euo pipefail

DOCKER_USER=kalpak44
APP_NAME=router-app
IMAGE_TAG=latest
IMAGE_NAME=${DOCKER_USER}/${APP_NAME}:${IMAGE_TAG}
NAMESPACE=userspace

echo "🔧 Building Docker image..."
docker build -t $IMAGE_NAME .

echo "📤 Pushing image to Docker Hub..."
docker push $IMAGE_NAME

echo "🚀 Creating namespace if missing..."
kubectl get namespace $NAMESPACE >/dev/null 2>&1 || kubectl create namespace $NAMESPACE

echo "🛡️ Applying RBAC..."
kubectl apply -n $NAMESPACE -f - <<EOF
apiVersion: v1
kind: ServiceAccount
metadata:
  name: $APP_NAME
  namespace: $NAMESPACE
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: ${APP_NAME}-job-launcher
  namespace: $NAMESPACE
rules:
  - apiGroups: ["batch"]
    resources: ["jobs"]
    verbs: ["create"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: ${APP_NAME}-job-launcher-bind
  namespace: $NAMESPACE
subjects:
  - kind: ServiceAccount
    name: $APP_NAME
roleRef:
  kind: Role
  name: ${APP_NAME}-job-launcher
  apiGroup: rbac.authorization.k8s.io
EOF

echo "📄 Deploying router app..."
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
      serviceAccountName: $APP_NAME
      containers:
        - name: router
          image: $IMAGE_NAME
          imagePullPolicy: Always
          ports:
            - containerPort: 8080
EOF
echo "✅ Done. App is deployed in namespace '$NAMESPACE'"
kubectl get pods -n $NAMESPACE -l app=$APP_NAME

echo "📈 Deploying KEDA ScaledObject..."
kubectl apply -n $NAMESPACE -f - <<EOF
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: ${APP_NAME}-scaler
  namespace: $NAMESPACE
spec:
  scaleTargetRef:
    name: $APP_NAME
  pollingInterval: 5
  cooldownPeriod: 30
  minReplicaCount: 0
  maxReplicaCount: 1
  triggers:
    - type: kafka
      metadata:
        bootstrapServers: kafka.kafka.svc:9092
        topic: event-topic
        consumerGroup: ${APP_NAME}-group
        lagThreshold: "1"
EOF
