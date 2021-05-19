echo "[macOS] Building"
electron-packager . rblxRP --app-version 2.3.0 --platform darwin --out ./build --overwrite --icon ./ico/logo.icns
/usr/libexec/PlistBuddy -c 'add LSUIElement string 1' ./build/rblxrp-darwin-x64/rblxRP.app/Contents/Info.plist
echo "[macOS] Packaging"
electron-installer-dmg ./build/rblxrp-darwin-x64/rblxRP.app rblxRP --out=./build --icon=./ico/logo.icns --overwrite