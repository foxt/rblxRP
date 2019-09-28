echo "[macOS] Building"
electron-packager . rblxRP --platform darwin --out ./build --overwrite --icon ./ico/logo.icns
echo "[macOS] Packaging"
electron-installer-dmg ./build/rblxrp-darwin-x64/rblxRP.app rblxRP --out=./build --icon=./ico/logo.icns --overwrite