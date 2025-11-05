#!/bin/bash

if [ -z "$CAPSULE_KEY" ]; then
  echo "Error: CAPSULE_KEY environment variable must be set"
  echo "Usage: CAPSULE_KEY=xxx ./direct-pinata-query.sh"
  exit 1
fi

echo "=== DIRECT PINATA API QUERY ==="
echo "Querying CAPSULE account..."
echo ""
echo "Using key: ${CAPSULE_KEY:0:30}..."
echo ""

curl -s "https://api.pinata.cloud/data/userPinnedDataTotal?t=$(date +%s)&r=$RANDOM" \
  -H "Authorization: Bearer $CAPSULE_KEY" \
  -H "Cache-Control: no-cache" | jq '.'

echo ""
echo "If pin_size_total is still showing old values, Pinata's API is cached on their end."
echo "This typically updates within 5-10 minutes."
