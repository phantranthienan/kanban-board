#!/bin/bash
# Define the script directory
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
PROJECT_ROOT="$SCRIPT_DIR/../.."  # Adjust based on relative project structure

# Define directories and filenames
TLS_DIR="$PROJECT_ROOT/infrastructure/tls"
CERT_FILE="$TLS_DIR/certificate.crt"
KEY_FILE="$TLS_DIR/private.key"

# Create the TLS directory if it doesn't exist
mkdir -p $TLS_DIR

# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout $KEY_FILE \
  -out $CERT_FILE \
  -subj "/CN=localhost"

# Display success message
echo "Self-signed certificate and key generated:"
echo "Certificate: $CERT_FILE"
echo "Key: $KEY_FILE"
