## [Downloads here](http://rblxrp.xyz)
# rblxRP 3.0
Adds Discord rich presence for Roblox.

[Join the Discord server](https://discord.gg/5aQSDGCTX6)


## Building
### Install dependencies
```
npm i
npm i -g pkg
```
### Dev
```
tsc --watch
```

### Build
```
tsc
bash build.sh
```
## File structure
Root directory of code is `src/`.

`state/providers/gameDetection.ts` handles the detection of Roblox game instances

`state/providers/gameInfo.ts` handles the fetching of Roblox game information

`state/stateManager.ts` is the main business logic for managing states and reducing them to the currently published state.

`config.ts` handles saving & loading of user configuration data

`discord.ts` handles publishing the state to Discord. (see also, [`@rblxrp/easy-presence`](https://github.com/rblxrp/easy-presence))

`icon.ts` contains the app icon

`index.ts` handles the user interface and initialises everything

`webserver.ts` handles the creation of the web server.
