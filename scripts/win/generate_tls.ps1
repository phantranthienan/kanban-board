# PowerShell script to generate self-signed TLS certificates

# Resolve script directory and project root
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$PROJECT_ROOT = Join-Path $SCRIPT_DIR "../.."

# Define directories and filenames
$TLS_DIR = "$PROJECT_ROOT/infrastructure/tls"
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

# Output success message
Write-Host "Certificate generated:"
Write-Host "Certificate: $CERT_FILE"
Write-Host "Key: $KEY_FILE"
