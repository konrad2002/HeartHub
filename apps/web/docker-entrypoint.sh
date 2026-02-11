#!/bin/sh
set -e

# Create a runtime configuration file with environment variables
cat > /app/public/env-config.js << EOF
window.__ENV__ = {
  NEXT_PUBLIC_API_BASE_URL: '${NEXT_PUBLIC_API_BASE_URL:-http://localhost:3000}',
};
EOF

# Start the Next.js application
exec node server.js
