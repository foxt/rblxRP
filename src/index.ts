import discord from "./discord";
import stateManager from "./state/stateManager";
import config from "./config";
import SysTray from "systray";
import icon from "./icon"
import {spawn} from "child_process";
import WebSocket from "ws";
import {URL} from "url";
import {notify} from "node-notifier";
import {dirname, join} from "path";
import fetch from "node-fetch";
import { existsSync, fstat, mkdirSync, unlinkSync, writeFileSync } from "fs";
import { server } from "./webserver";
import { homedir } from "os";

process.env["EZP-DEBUG"] = 'true'

function openURL(url) {
    if (process.platform === "darwin") {
        spawn("open", [url]);
    } else if (process.platform === "win32") {
        spawn("rundll32", ["url.dll,FileProtocolHandler", url]);
    } else if (process.platform === "linux") {
        spawn("xdg-open", [url]);
    }
}

function updateStudioPlugin() {
    try {
        var root = process.platform == "win32" ? 'AppData\\Local' : 'Documents'
        if (config.studioPresence) {
            if (!existsSync(join(homedir(),root,"Roblox"))) mkdirSync(join(homedir(),root,"Roblox"));
            if (!existsSync(join(homedir(),root,"Roblox","Plugins"))) mkdirSync(join(homedir(),root,"Roblox","Plugins"));
            writeFileSync(join(homedir(),root,"Roblox","Plugins","rblxRPPlugin.lua"), `local a="http://127.0.0.1:5816/"local b=game:GetService("StudioService")local c=game:GetService("ServerStorage")local d=game:GetService("HttpService")local e=game:GetService("Selection")local f=""local g=false;function debugLog(h)if c:FindFirstChild("rblxrpdebug")then print("[rblxRP] "..h)end end;while wait(5)do local i,j=pcall(function()debugLog("pinging..."..a.."pingState")d:PostAsync(a.."pingState","")debugLog("pong")local k=d:UrlEncode(game.PlaceId or 0)local l=d:UrlEncode(game.Name or"Place1")local m=d:UrlEncode("Working on a game")if b.ActiveScript~=nil then m=d:UrlEncode(b.ActiveScript.Name)end;local n=a.."reportState/"..k.."/"..l.."/"..m;debugLog(n)if n==f and not g then return end;g=true;debugLog("posting..."..n)d:PostAsync(n,"")debugLog("posted state "..n)g=false;f=n end)if not i then debugLog("failed "..j)end end;e.SelectionChanged:Connect(function()if not g then debugLog("forcing next state update")end;g=true end)`)
        } else {
            unlinkSync(join(homedir(),root,"Roblox","Plugins","rblxRPPlugin.lua"))
        }
    } catch(e) {
        
    }
}

function openConfig() {
    server.ws.on("connection", (conn, req) => {
        console.log("[WbSk] incoming", req.headers.origin);
        //if (new URL(req.headers.origin).host !== "rblxrp.xyz") return conn.close();
        conn.on("message", (msg) => {
            var j = JSON.parse(msg.toString());
            for (var k in j)
                if (typeof config[k] == typeof j[k]) config[k] = j[k];
            if (j["studioPresnce"]) setTimeout(updateStudioPlugin,50);
            console.log("[WbSk] ", config);
            config.save();
            wsBroadcast();
        });
        notify({
            title: "Opening config...",
            message: "Config was opened in your default browser.",
            icon: join(__dirname, "..", "ico", "logo.png"),
            contentImage: join(__dirname, "..", "ico", "logo.png")
        });
        wsBroadcast()
    });


    openURL("http://rblxrp.xyz/config.html")
}

function wsBroadcast() {
    for (var client of server.ws.clients) setTimeout(() => client.send(JSON.stringify({
        state: stateManager.state,
        config: config,
        discord: {
            env: discord.environment,
            status: discord.status
        },
        version: require("../package.json").version
    })), 15);
}
discord.on("DISPATCH", wsBroadcast);
discord.on("connected", wsBroadcast);
discord.on("disconnected", wsBroadcast);
discord.on("connecting", wsBroadcast);
stateManager.on("updateState", wsBroadcast);;
(async () => {
    var firstItem = "Open Config";
    try {
        var releasesF = await fetch("https://api.github.com/repos/rblxRP/rblxRP/releases");
        var releasesJ = await releasesF.json();
        var first = releasesJ[0];
        if (first.tag_name != require("../package.json").version) {
            firstItem = "Update rblxRP";
        }

    } catch (e) {
        console.error("[Updt]", e)
    }
    var traybinPath;
    var deploypath = dirname(process.execPath)
    if (existsSync(join(deploypath, "notifier"))) traybinPath = join(deploypath, "notifier");
    console.log("tbp",traybinPath,deploypath)
    const tray = new SysTray({
        traybinPath,
        menu: {
            icon,
            title: "",
            tooltip: "rblxRP",
            items: [{
                    title: firstItem,
                    tooltip: "Open in the default web browser",
                    enabled: true,
                    checked: false
                },
                {
                    title: "Quit",
                    tooltip: "Exits out of rblxRP",
                    enabled: true,
                    checked: false
                }
            ]
        }
    })
    tray.onClick((action) => {
        switch (action.item.title) {
            case "Open Config":
                openConfig()
                break;
            case "Update rblxRP":
                openURL("http://rblxrp.xyz");
                break;
            case "Quit":
                tray.kill();
                process.exit();
        }
    }) 
    if (firstItem == "Update rblxRP")
        notify({
            title: "Update rblxRP",
            message: "There is a new version of rblxRP available.",
            icon: join(__dirname, "..", "ico", "logo.png"),
            contentImage: join(__dirname, "..", "ico", "logo.png")
        }, (_e,r,_m) => {
            if (r == "activate") openURL("http://rblxrp.xyz");

        })

    // eslint-disable-next-line dot-notation
    global["tray"] = tray; // To prevent win from being garbage collected.

    updateStudioPlugin();
})()