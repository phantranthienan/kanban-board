$TLS_DIR = "../tls"
$CERT_FILE = "$TLS_DIR\certificate.crt"
$KEY_FILE = "$TLS_DIR\private.key"

# Create the TLS directory if it doesn't exist
if (-not (Test-Path $TLS_DIR)) {
    New-Item -ItemType Directory -Path $TLS_DIR
}

# Generate the certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 `
    -keyout $KEY_FILE `
    -out $CERT_FILE `
    -subj "/CN=localhost"

Write-Host "Certificate generated:"
Write-Host "Certificate: $CERT_FILE"
Write-Host "Key: $KEY_FILE"
