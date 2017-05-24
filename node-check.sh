#!/bin/bash
set -e

OS_RUNTIME_DIR="/var/run/mysterium-client"

if [ ! -d "$OS_RUNTIME_DIR" ]; then
  mkdir -p "$OS_RUNTIME_DIR"
fi

echo Attempting to connect to Mysterium node \'$NODE\'...
exec /usr/bin/mysterium_client --runtime-dir=$OS_RUNTIME_DIR --node=$NODE

echo Waiting 5 seconds...
exec sleep 5
