rm -rf dist
mkdir dist

ncc build index.js -o dist
cd dist
mv index.js rblxrp.js
pkg rblxrp.js
cd ..
