rm -rf dist
mkdir dist

ncc build index.js -o dist
cd dist
mv index.js rblxrp.js
pkg rblxrp.js -t node10-macos-x64,node10-win-x64
cd ..
