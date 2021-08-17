echo "[macOS] Building"

npx @nodegui/packer --pack ./build/      # Pack the app

echo "[macOS] Branding"
cp -R ico ./deploy/darwin/build/rblxRP.app/Contents/Resources/