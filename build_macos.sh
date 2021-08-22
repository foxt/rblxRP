echo "[macOS] Packing"
./node_modules/.bin/webpack --mode=production

echo "Press a key to continue." 
read -n 1

echo "[macOS] Building"

npx @nodegui/packer --pack ./dist/      # Pack the app

echo "[macOS] Branding"
cp -R ico ./deploy/darwin/build/rblxRP.app/Contents/Resources/