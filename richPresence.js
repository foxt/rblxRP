const util = require("./util");
const RPC = require("discord-rpc");
const fetch = require("node-fetch");
const rpc = global.rpc = new RPC.Client({ transport: "ipc" });

global.cache = {};
async function procDetect() {
    console.log("[Detect:Proc] Detecting Roblox with process method");
    let processes = await util.getProcesses({
        command: "RobloxPlayer"
    });
    console.log("[Detect:Proc] Detected", processes.length, "Roblox instances running");
    if (processes.length < 1) {
        return false;
    }
    console.log(processes[0]);
    let scriptUrl = util.getScriptUrl(processes[0].arguments);
    if (scriptUrl == false) {
        console.log("[Detect:Proc] Couldn't find the script URL");
    } else {
        console.log("[Detect:Proc] Script URL", scriptUrl);
    }
    if (!scriptUrl.includes("placeId=")) {
        console.log("[Detect:Proc] Malformed script URL");
        return false;
    }
    let split = parseInt(scriptUrl.split("placeId=")[1]);
    if (isNaN(split)) {
        console.log("[Detect:Proc] Malformed script URL");
        return false;
    }
    console.log("[Detect:Proc] Found game ID", split);
    return split;
}

async function detectGame() {
    console.log("[Detect] Trying to find Roblox...");
    let detection = await procDetect();
    return detection;
}


async function getGameFromCache(gameid) {
    if (global.cache[gameid]) { return global.cache[gameid]; }
    try {
        let apiResponse = await fetch("https://api.roblox.com/marketplace/productinfo?assetId=" + gameid);
        if (!apiResponse.ok) { throw new Error("Could not get game info from Roblox API."); }
        let j = await apiResponse.json();
        let obj = {
            name: j.Name,
            by: j.Creator.Name,
            iconkey: global.configJSON.defaultIconKey,
            id: gameid
        };
        global.cache[gameid] = obj;
        return obj;
    } catch (e) {
        console.error(e);
        return {
            name: "a game",
            by: "someone",
            iconkey: global.configJSON.defaultIconKey,
            id: gameid
        };
    }
}
let timeout = 15000;
global.lastPresense = false;
async function doTheThing() {
    /* if (global.configJSON.studioEnabled) {
        console.log("Checking for Studio");
        let active = await util.getActiveWindow();
        if (active) {
            if (active.app == "RobloxStudio") {
                console.log("Script/Game open in Studio is: ", active.title.split(" - ")[0]);
                global.tray.setTitle(active.title);
                if (global.lastPresense != active.title) {
                    rpc.setActivity({
                        details: "Roblox Studio",
                        state: active.title.split(" - ")[0],
                        startTimestamp: 0,
                        largeImageKey: "rstudio",
                        largeImageText: "remind me to put something here",
                        smallImageKey: "rblxrp",
                        smallImageText: "https://github.com/thelmgn/rblxrp",
                        instance: false
                    });
                } else { timeout = 1000; }
                global.lastPresense = active.title;
                return global.lastPresense;
            } else {
                console.log("RobloxStudio is not the foreground app, it is", active.app);
            }
        }
    }*/

    if (!global.configJSON.enabled) {
        if (global.lastPresense != false) {
            rpc.clearActivity();
        } else {
            timeout = 1000;
        }
        global.lastPresense = false;
        return;
    }
    console.log("Updating presense");
    let playing = await detectGame();
    if (playing == false || !global.configJSON.enabled) {
        if (global.lastPresense != false) {
            rpc.clearActivity();
        } else {
            timeout = 1000;
        }
        global.tray.setTitle("");
        if (global.configJSON.enabled) {
            console.log("Not playing anything. Open Roblox and try it out!");
        } else {
            console.log("rblxRP disabled.");
        }

        global.lastPresense = false;
        return;
    }
    let game = await getGameFromCache(playing);
    console.log("Playing", game.name, "by", game.by);
    global.tray.setTitle(game.name, "by", game.by);
    console.log(game);
    if (global.lastPresense != game) {
        rpc.setActivity({
            details: game.name,
            state: `by ${game.by}`,
            startTimestamp: 0,
            largeImageKey: game.iconkey,
            smallImageKey: "rblxrp",
            smallImageText: "https://github.com/thelmgn/rblxrp",
            buttons: [
                {
                    label: "► Play",
                    url: "https://www.roblox.com/games/" + (game.id || game.iconkey)
                }
            ],
            instance: false
        });
    } else { timeout = 1000; }

    global.lastPresense = game;
}

async function interval() {
    timeout = 15000;
    try {
        await doTheThing();
    } catch (e) {
        console.error(e);
    }
    setTimeout(interval, timeout);
}



module.exports = { interval };