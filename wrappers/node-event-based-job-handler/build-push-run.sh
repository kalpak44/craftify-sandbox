#!/bin/bash

set -e

IMAGE_NAME="kalpak44/craftify-function"
TAG="latest"

echo "🔐 Checking Docker login..."
if ! docker info | grep -q Username; then
  echo "Please log in to Docker Hub:"
  docker login
fi

echo "📦 Building Docker image..."
docker build -t ${IMAGE_NAME}:${TAG} .

echo "🚀 Pushing image to Docker Hub..."
docker push ${IMAGE_NAME}:${TAG}

echo "🧪 Running function with sample event..."

docker run --rm -i ${IMAGE_NAME}:${TAG} <<EOF
{
  "event_type": "user.registered",
  "payload": {
    "user": {
      "name": "Jane Doe",
      "email": "jane@example.com"
    }
  }
}
EOF
