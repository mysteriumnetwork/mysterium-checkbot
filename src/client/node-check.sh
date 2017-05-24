#!/bin/bash
set -e

OS_RUNTIME_DIR="/var/run/mysterium-client"
CLIENT_BIN="mysterium_client"
TUNNEL_INTERFACE="tun0"

# Make sure to kill the mysterium client process on script exit
function finish {
  echo Cleaning up...
  PID=$(pidof $CLIENT_BIN)
  if [ $PID -gt 0 ]; then
    kill -9 $(pidof $CLIENT_BIN)
  fi
}
trap finish EXIT

# Create the network device root if it doesn't exist
if [ ! -d /dev/net ]; then
    mkdir -p /dev/net
fi

# Create the tunnel device node if it doesn't exist
if [ ! -c /dev/net/tun ]; then
    mknod /dev/net/tun c 10 200
fi

# Create the runtime directory if it doesn't exist
if [ ! -d "$OS_RUNTIME_DIR" ]; then
  mkdir -p "$OS_RUNTIME_DIR"
fi

# Make Mysterium client connection to node
echo Attempting to connect to Mysterium node \'$NODE\'...
exec /usr/bin/$CLIENT_BIN --runtime-dir=$OS_RUNTIME_DIR --node=$NODE > /tmp/client.log &

# Wait for tunnel to be established
NEXT_WAIT_TIME=0
until grep -q -E $TUNNEL_INTERFACE /proc/net/dev || [ $NEXT_WAIT_TIME -eq 4 ]; do
  sleep $(( NEXT_WAIT_TIME++ ))
done

# If unable to create tunnel, throw error
if ! grep -q -E $TUNNEL_INTERFACE /proc/net/dev; then
  echo Unable to create tunnel to node \'$NODE\'!
  exit 2
fi

# Tunnel is good, try to make basic curl request
echo Successfully connected to node \'$NODE\'.
echo Checking internet access...
RESPONSE=$(curl -s --max-time 15 -L ipconfig.me)

# Verify we were able to get a WAN IP
STATUS=$?; if [ $STATUS != 0 ]; then
  echo No WAN access through node \'$NODE\'!
  exit 3
fi

# Success!
echo Successfully routed through node \'$NODE\'.
echo WAN IP: $RESPONSE
exit 0
