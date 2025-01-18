#!/bin/bash

# Define directories and filenames
TLS_DIR="../tls"
CERT_FILE="$TLS_DIR/certificate.crt"
KEY_FILE="$TLS_DIR/private.key"

mkdir -p $TLS_DIR

# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout $KEY_FILE \
  -out $CERT_FILE \
  -subj "/CN=localhost"

echo "Self-signed certificate and key generated:"
echo "Certificate: $CERT_FILE"
echo "Key: $KEY_FILE" 