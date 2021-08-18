echo "[macOS] Building"

npx @nodegui/packer --pack ./app/      # Pack the app

echo "[macOS] Branding"
cp -R ico ./deploy/darwin/build/rblxRP.app/Contents/Resources/