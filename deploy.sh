#!/usr/bin/env bash
AWS_ECR_REGISTRY=335855654610.dkr.ecr.us-east-1.amazonaws.com
AWS_REGION=us-east-1
ECR_REPO_NAME=scraper-runner
ECR_TAG=latest

echo "Logging into Amazon ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin "${AWS_ECR_REGISTRY}"

# echo "Building app..."
# yarn install --production=false
# yarn build:pre
# yarn build:server

echo "Building docker image..."
docker build --build-arg DOCKER_REGISTRY=$AWS_ECR_REGISTRY -t "$ECR_REPO_NAME:$ECR_TAG" -f Dockerfile .
echo "Built image \"$ECR_REPO_NAME:$ECR_TAG\""

echo "Tagging image..."
docker tag "$ECR_REPO_NAME:$ECR_TAG" "$AWS_ECR_REGISTRY/$ECR_REPO_NAME:$ECR_TAG"

echo "Pushing the Docker image..."
docker push $AWS_ECR_REGISTRY/$ECR_REPO_NAME:$ECR_TAG
echo "Done"
