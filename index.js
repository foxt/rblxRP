const fetch = require("node-fetch");
const {app, BrowserWindow,Notification,Menu, Tray} = require('electron')
const RPC = require("discord-rpc");
const util = require("./util")
const os = require("os")
const fs = require("fs")

const clientId = '626092891667824688';
var defaultIconKey = "logo_shiny" // logo_old, logo_red, logo_shiny

const rpc = new RPC.Client({ transport: 'ipc' });
var tray,contextMenu

var cache = {}

async function exit() {
    try { await rpc.clearActivity() } catch(e) {}
    process.kill(process.pid)
}

async function menu(item) {
    item.checked = true
    defaultIconKey = item.id
    for (var i in cache) {
        if (cache[i].iconkey == "logo_shiny" ||cache[i].iconkey == "logo_red" ||cache[i].iconkey == "logo_old") {
            cache[i].iconkey = defaultIconKey
        }
    }
    lastPresense = false // force presense update
}

function getVersion() {
    if (fs.existsSync("./package.json")) {
        try {
            var file = JSON.parse(fs.readFileSync("./package.json").toString())
            if (file.version) {
                return file.version + " "
            } else {
                return ""
            }
        } catch(e) {return""}
    } else {

        return ""
    }
}

async function procDetect() {
    console.log("[Detect:Proc] Detecting Roblox with process method")
    var processes = await util.getProcesses({
        command: "RobloxPlayer"
    })
    console.log("[Detect:Proc] Detected",processes.length,"Roblox instances running")
    if (processes.length < 1) {
        return false
    } 
    var scriptUrl = util.getScriptUrl(processes[0].arguments)
    if (scriptUrl == false) {
        console.log("[Detect:Proc] Couldn't find the script URL")
    } else {
        console.log("[Detect:Proc] Script URL",scriptUrl)
    }
    if (!scriptUrl.includes("placeId=")) {
        console.log("[Detect:Proc] Malformed script URL")
        return false
    }
    var split = parseInt(scriptUrl.split("placeId=")[1])
    if (isNaN(split)) {
        console.log("[Detect:Proc] Malformed script URL")
        return false
    }
    console.log("[Detect:Proc] Found game ID",split)
    return split
}

async function detectAPI() {
    console.log("[Detect:API] Seeing if user",ruserid,"is playing Roblox")
    try {
        var ftch = await fetch(`https://api.roblox.com/users/${ruserid}/onlinestatus`)
        var j = await ftch.json()
        
    } catch(e) {
        console.log("[Detect:API] Failed,",e)
    }
    return false
    
}

async function detectGame() {
    console.log("[Detect] Trying to find Roblox...")
    var detection = await procDetect()
    return detection
    if (detection == false) {
        console.log("[Detect:Proc] Didn't find a running instance.")
        
        if (apiDetect) {
            detection = await detectAPI()
            if (detection == false) {
                console.log("[Detect:API] Didn't find user", ruserid, "playing a game? Do you have privacy settings to 'Everyone can join my game?'")
                return false
            }
        } else {
            return false
        }
        
    } else {
        return false
    }
}


async function getGameFromCache(gameid) {
    if (cache[gameid]) {return cache[gameid]}
    try {
        var apiResponse = await fetch("https://api.roblox.com/marketplace/productinfo?assetId=" + gameid)
        if (!apiResponse.ok) {throw new Error(apiResponse)}
        var j = await apiResponse.json()
        var obj = {
            name: j.Name,
            by: j.Creator.Name,
            iconkey: defaultIconKey
        }
        cache[gameid] = obj
        return obj
    } catch(e) {
        console.error(e)
        return {
            name:"(unknown)",
            by: "(unknown)",
            iconkey: defaultIconKey
        }
    }
}
var timeout = 15000
var lastPresense = false
var enabled = true
async function doTheThing() {
    console.log("Updating presense")
    var playing = await detectGame()
    if (playing == false || !enabled) {
        if (lastPresense != false) {
            rpc.clearActivity()
        } else {
            timeout = 1000
        }
        tray.setTitle("")
        if (enabled) {
            console.log("Not playing anything. Open Roblox and try it out!") 
        } else {
            console.log("rblxRP disabled.")
        }
        
        lastPresense = false
        return 
    }
    var game = await getGameFromCache(playing)
    console.log("Playing",game.name, "by",game.by)
    tray.setTitle(game.name, "by",game.by)
    if (lastPresense != game) {
        rpc.setActivity({
            details:game.name,
            state:  `by ${game.by}`,
            startTimestamp: new Date(),
            largeImageKey: game.iconkey,
            largeImageText: `rblxRP ${getVersion()}`,
            smallImageKey: 'rblxrp',
            smallImageText: 'https://github.com/thelmgn/rblxrp',
            instance: false,
        });
    }  else { timeout = 1000 }
    
    lastPresense = game

}

async function interval() {
    timeout = 15000
    try {
        await doTheThing()
    } catch(e) {
        console.error(e)
    }
    setTimeout(interval,timeout)
}
rpc.on("ready",async function() {
    new Notification({
        title: "rblxRP is ready!",
        body: "Hi there, " + rpc.user.username + "!",
        silent:true
    }).show()
    console.log("Connected to Discord")
    contextMenu = Menu.buildFromTemplate([
        { label: "Enable", type: 'checkbox',checked:enabled,click: function() {
            console.log("Toggling enabled")
            enabled = !enabled
            contextMenu.items[0].checked = enabled
        } },
        {
            label: "Default game icon",
            type: "submenu",
            submenu: [
                { label: "Shiny", id: "logo_shiny", type: "radio", checked:true,click:menu},
                { label: "Red", id:"logo_red", type: "radio",click:menu},
                { label: "Old 'R' Logo", id:"logo_old", type: "radio",click:menu},
            ]
        },
        { label: 'Quit',click: exit},
        {type:"separator"},
        { label: 'rblxRP ' + getVersion() + "by theLMGN",enabled:false},
        { label: 'GitHub',click: function() {

        }},
      ])
    tray.setContextMenu(contextMenu)
    tray.setToolTip('rblxRP')
    tray.setTitle("")
    interval()
})

async function go() {
    try {
        try {
            app.dock.hide()
        } catch(e) {}
        var logo ="ico/logo_white.png"
        if (os.platform() == "win32") { logo = "ico/logo.ico" }
        try {
            tray = new Tray(logo)
        } catch(e) {
            tray = new Tray(app.getAppPath() + '/' + logo)
        }
        contextMenu = Menu.buildFromTemplate([
          { label: 'Quit', click: exit }
        ])
        tray.setToolTip('rblxRP')
        tray.setContextMenu(contextMenu)

        console.log("Downloading configuration...")
        tray.setTitle("Downloading config...")
        var req = await fetch("https://gist.githubusercontent.com/theLMGN/3799b5cb7b0328be7a13860e46832b0e/raw/9f73d30f4e6369ef976234eb99ed8207363d24ea/rblxrp_config.json")
        if (!req.ok) {throw new Error("not ok!")}
        var j = await req.json()
        cache = j.games
        console.log("Downloaded configuration!")

        console.log("Connecting to Discord...")
        tray.setTitle("Connecting to Discord...")
        rpc.login({clientId}).catch(function(e) {
            console.error("Failed to connect to Discord... ",e, "Will try again in 15 seconds")
            new Notification({
                title: "rblxRP failed to connect to Discord",
                body: "Will try again in 15 seconds",
                silent:true
            }).show()
            setTimeout(go,15000)
        })        
    } catch(e) {
        console.error(e, ". Trying again in 15 seconds")
        new Notification({
            title: "rblxRP failed to load",
            body: "Will try again in 15 seconds",
            silent:true
        }).show()
        setTimeout(go,15000)
    }
}
app.on('ready', go)
