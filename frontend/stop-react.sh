#!/bin/bash

# Kill the process running on the port (assuming React runs on port 5173)
lsof -i :5173 | grep node | awk '{print $2}' | xargs kill
