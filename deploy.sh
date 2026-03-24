#!/bin/bash
# Deploy ABV to EC2
# Usage: ./deploy.sh <ec2-user@ec2-ip> <path-to-key.pem>
#
# Example: ./deploy.sh ubuntu@13.232.100.50 ~/keys/my-key.pem

EC2_HOST=$1
KEY_FILE=$2

if [ -z "$EC2_HOST" ] || [ -z "$KEY_FILE" ]; then
  echo "Usage: ./deploy.sh <ec2-user@ec2-ip> <path-to-key.pem>"
  echo "Example: ./deploy.sh ubuntu@13.232.100.50 ~/keys/my-key.pem"
  exit 1
fi

echo "==> Building production bundle..."
npm run build

echo "==> Uploading files to EC2..."
scp -i "$KEY_FILE" -r dist/* "$EC2_HOST":~/abv-app/

echo "==> Setting up Nginx on EC2..."
ssh -i "$KEY_FILE" "$EC2_HOST" << 'REMOTE'
  sudo apt update -y && sudo apt install -y nginx

  # Create app directory
  sudo mkdir -p /var/www/abv
  sudo cp -r ~/abv-app/* /var/www/abv/
  sudo chown -R www-data:www-data /var/www/abv

  # Nginx config
  sudo tee /etc/nginx/sites-available/abv > /dev/null << 'NGINX'
server {
    listen 8827;
    server_name _;
    root /var/www/abv;
    index index.html;

    # Disable video download headers
    location ~* \.(mp4|webm|ogg)$ {
        add_header Content-Disposition "inline";
        add_header X-Content-Type-Options "nosniff";
        add_header Cache-Control "no-store, no-cache";
        # Block direct access - only allow from same origin
        valid_referers server_names;
        if ($invalid_referer) {
            return 403;
        }
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Block access to hidden files
    location ~ /\. {
        deny all;
    }
}
NGINX

  sudo ln -sf /etc/nginx/sites-available/abv /etc/nginx/sites-enabled/
  sudo nginx -t && sudo systemctl restart nginx

  echo "==> Done! App running on port 8827"
REMOTE

echo ""
echo "==> Deployed! Open http://$( echo $EC2_HOST | cut -d'@' -f2 ):8827"
