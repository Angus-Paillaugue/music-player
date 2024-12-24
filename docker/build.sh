#!/bin/bash

# Build the Docker image
docker build -t music-player:latest -f$(dirname "$0")/../Dockerfile $(dirname "$0")/../
