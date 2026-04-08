#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
export PATH="/Users/yiminghua/.nvm/versions/node/v20.20.2/bin:$PATH"
cd /Users/yiminghua/2026spring/redhackthon/Vibeverse/web
npx vite --host 0.0.0.0 --port 5173
