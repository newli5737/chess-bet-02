#!/bin/bash
# ============================================================
#  deploy2.sh — Deploy Frontend mới (cotuong2.linguagerman.com)
#  - Port: 3011
#  - Backend: dùng chung api-cotuong.linguagerman.com (không đụng)
# ============================================================
set -e

REPO_DIR="/home/ubuntu/chess-bet-02"
FE_DIR="$REPO_DIR/frontend"
PM2_APP="chess-frontend-2"
FE_PORT=3011

echo "======================================================"
echo " Chess Bet 02 — Frontend Deploy"
echo " Domain : cotuong2.linguagerman.com"
echo " Port   : $FE_PORT"
echo " Repo   : $REPO_DIR"
echo "======================================================"

# ── 1. Clone hoặc pull repo ────────────────────────────────
if [ -d "$REPO_DIR/.git" ]; then
  echo "[1/6] Pull latest code..."
  cd $REPO_DIR && git pull
else
  echo "[1/6] Clone repo..."
  git clone https://github.com/newli5737/chess-bet-02.git $REPO_DIR
fi

# ── 2. Ghi .env.local (production) ────────────────────────
echo "[2/6] Writing .env.local..."
cat > $FE_DIR/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=https://api-cotuong.linguagerman.com/api/v1
NEXT_PUBLIC_SOCKET_URL=https://api-cotuong.linguagerman.com
EOF

# ── 3. Install & Build ────────────────────────────────────
echo "[3/6] npm install..."
cd $FE_DIR && npm install

echo "[4/6] npm run build..."
npm run build

# ── 4. PM2: khởi động / restart ──────────────────────────
echo "[5/6] Starting PM2 app '$PM2_APP' on port $FE_PORT..."
cd $FE_DIR

if pm2 describe $PM2_APP > /dev/null 2>&1; then
  pm2 restart $PM2_APP
else
  pm2 start "npm run start -- -p $FE_PORT" \
    --name $PM2_APP \
    --cwd  $FE_DIR
fi

pm2 save

# ── 5. Nginx config ───────────────────────────────────────
echo "[6/6] Deploying nginx config..."
sudo cp $REPO_DIR/deploy/nginx/cotuong2.linguagerman.com.conf \
        /etc/nginx/sites-available/cotuong2.linguagerman.com

sudo ln -sf \
  /etc/nginx/sites-available/cotuong2.linguagerman.com \
  /etc/nginx/sites-enabled/cotuong2.linguagerman.com

sudo nginx -t && sudo systemctl reload nginx

# ── Done ─────────────────────────────────────────────────
echo ""
echo "======================================================"
echo " ✅  Deploy xong!"
echo "    Frontend : https://cotuong2.linguagerman.com"
echo "    API      : https://api-cotuong.linguagerman.com"
echo "    PM2 app  : $PM2_APP (port $FE_PORT)"
echo "======================================================"
pm2 status $PM2_APP
