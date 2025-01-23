#!/bin/bash

# 只清理需要的端口
echo "Cleaning up ports..."
for port in 3000 3001 5001; do
    pid=$(lsof -ti :$port)
    if [ ! -z "$pid" ]; then
        echo "Killing process on port $port"
        kill -9 $pid 2>/dev/null
    fi
done

echo "Cleanup completed"
