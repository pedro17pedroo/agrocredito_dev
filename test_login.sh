#!/bin/bash
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"loginIdentifier":"+244923456789","password":"farmer123"}'