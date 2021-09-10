import { resolve } from "path";
import discord from "./discord";
import stateManager, { rblxrpErrorState, rblxrpGameState, rblxrpLoadingState } from "./state/stateManager";
import config from "./config";
import SysTray from "systray";
import { openStdin } from "process";
import icon from "./icon"
import { spawn } from "child_process";
import WebSocket from "ws";
import { URL } from "url";

process.env["EZP-DEBUG"] = 'true'

function openConfig() {
    if (global["wss"]) global["wss"].close();
    const wss = new WebSocket.Server({ port: 5816, host: "127.0.0.1" });
        global["wss"] = wss;
        console.log("listening");
        wss.on("connection", (conn,req) => {
            console.log("incoming",req.headers.origin);
            if (new URL(req.headers.origin).host !== "rblxrp.xyz") return conn.close();
            if (wss.clients.size > 1) return conn.close();
            conn.on("close", () => wss.close())
            conn.on("message", (msg) => {
                console.log(msg);
            });
            
        });

    if (process.platform === "darwin") { spawn("open", ["https://rblxrp.xyz/#config"]); }
    else if (process.platform === "win32") { spawn("rundll32", ["url.dll,FileProtocolHandler","https://rblxrp.xyz/#config"]); }
    else if (process.platform === "linux") { spawn("xdg-open", ["https://rblxrp.xyz/#config"]); }
}

const tray = new SysTray({
    menu: {
        icon,
        title: "",
        tooltip: "rblxRP",
        items: [
            {
                title: "Open Config",
                tooltip: "Open the config in the default web browser",
                enabled: true,
                checked:false
            },
            {
                title: "Quit",
                tooltip: "Exits out of rblxRP",
                enabled: true,
                checked:false
            }
        ]
    }
})
tray.onClick((action) => {
    switch (action.item.title) {
        case "Open Config":
            openConfig()
            break;
        case "Quit":
            tray.kill();
            process.exit();
    }
})

// eslint-disable-next-line dot-notation
global["tray"] = tray; // To prevent win from being garbage collected.