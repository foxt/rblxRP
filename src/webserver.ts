import express from 'express';
import { Server } from 'http';
import WebSocket from "ws";
class webServer {
    app: express.Application;
    ws : WebSocket.Server;
    srv: Server;
    constructor() {
        this.app = express();
        this.app.get("/" , (_,res) => res.redirect("https://rblxrp.xyz"));
        this.ws = new WebSocket.Server({noServer: true});
        this.srv = this.app.listen(5816, "127.0.0.1");
        this.srv.on("upgrade", (req,sock,head) => this.ws.handleUpgrade(req,sock,head,ws => this.ws.emit("connection",ws,req)));
    }
    
}
export const server = new webServer();