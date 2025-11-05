#!/bin/bash

CAPSULE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI0ZDA4NGQ2NC1mOWNmLTQ4ODItODNmMi0xOWJjYTdlZjNjOTUiLCJlbWFpbCI6Inhpbmd5YW5nMjkzQHByb3Rvbi5tZSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJlY2NjYTgyNTY2NTNhYmE0NzE2MCIsInNjb3BlZEtleVNlY3JldCI6IjEwYTZiZDk5ZTdlNzJiYzM5NzgzYThmNzcxNzlmNTJkZmFjOGQxNGNlNjkyY2UwOWFkOTA2NTlhYzg1ZjNhMGIiLCJleHAiOjE3OTExMTkzMzB9.T_Za8Cck8lrMDk0SzNpxuIM2dzgFkEwf-4PeARnyYgw"

echo "=== ALL PINNED FILES IN CAPSULE ACCOUNT ==="
curl -s "https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=100" \
  -H "Authorization: Bearer $CAPSULE_KEY" | jq '.rows[] | {cid: .ipfs_pin_hash, size: .size, name: .metadata.name, date: .date_pinned}'

echo ""
echo "=== SUMMARY ==="
curl -s "https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=100" \
  -H "Authorization: Bearer $CAPSULE_KEY" | jq '{count: .count, total_size: ([.rows[].size] | add)}'
