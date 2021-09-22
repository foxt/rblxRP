

rm -rf deploy
mkdir deploy
pkg .
cd deploy
mkdir win
mkdir mac

mv *.exe win
mkdir win/notifier
cp ../node_modules/node-notifier/vendor/snoreToast/snoretoast-x86.exe win/notifier
cp ../node_modules/node-notifier/vendor/snoreToast/snoretoast-x64.exe win/notifier
cp ../node_modules/node-notifier/vendor/notifu/notifu.exe win/notifier
cp ../node_modules/node-notifier/vendor/notifu/notifu64.exe win/notifier
cp ../node_modules/systray/traybin/tray_windows_release.exe win/notifier
echo "Set oShell = WScript.CreateObject(\"WScript.Shell\")" > win/start.vbs
echo "oShell.Run \"taskkill /f /im rblxrp-win.exe\", 0, True" >> win/start.vbs
echo "WScript.Sleep 100" >> win/start.vbs
echo "oShell.Run \"rblxrp-win.exe\", 0, True" >> win/start.vbs


mv *-macos mac
mkdir mac/notifier
cp ../node_modules/node-notifier/vendor/mac.noindex/terminal-notifier.app/Contents/Resources/en.lproj/MainMenu.nib mac/notifier
cp ../node_modules/node-notifier/vendor/mac.noindex/terminal-notifier.app/Contents/Info.plist mac/notifier
cp ../node_modules/node-notifier/vendor/mac.noindex/terminal-notifier.app/Contents/MacOS/terminal-notifier mac/notifier
cp ../node_modules/systray/traybin/tray_darwin_release mac/notifier
cp -r ../rblxRP.app ./
mv mac/* ./rblxRP.app/Contents/MacOS/
rm -rf mac 

zip -9r rblxrp-X.X.X-darwin.zip rblxRP.app
zip -9r rblxrp-X.X.X-win32.zip win