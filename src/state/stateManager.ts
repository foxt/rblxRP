import EventEmitter from "events";
import { notify } from "node-notifier";
import { join } from "path";
import config from "../config";
import { server } from "../webserver";
import { getRunningGameId } from "./providers/gameDetection";
import { fetchRemoteConfig, GameInfo, getGameInfo } from "./providers/gameInfo";

export interface ProvidedState {
    gameId: string,
    gameName?: string,
    iconText?: string,
    iconKey?: string,
    state: string,
}

export interface rblxrpState {
    type: "none" | "game" | "error" | "loading" | "studio"
}
export interface rblxrpNoneState extends rblxrpState { type: "none" }

export interface rblxrpErrorState extends rblxrpState { type: "error", error: Error }
export interface rblxrpLoadingState extends rblxrpState { type: "loading", message: string }

export interface rblxrpStateWithGame extends rblxrpState {
    type: "game" | "studio";
    gameId: string,
    info: Promise<GameInfo> | GameInfo
    providedState?: ProvidedState,
    creationTime: Date
}

export interface rblxrpGameState extends rblxrpStateWithGame {
    type: "game",
}
export interface rblxrpStudioState extends rblxrpStateWithGame {
    type: "studio",
    providedState: ProvidedState // Required for studio states
    gameName: string
}

class StateManager extends EventEmitter {
    connectToRemote = false;
    state: rblxrpState = { type: "loading", message: "Loading..." } as rblxrpLoadingState;
    constructor() {
        super();
        // eslint-disable-next-line no-return-assign
        this.on("updateState", (s: rblxrpState) => this.state = s);
        setInterval(this.detect.bind(this), 15000);
        
        server.app.post("/reportState/:id/:name/:action",this.handleStudioState.bind(this));
        server.app.post("/pingState",this.handleStudioPing.bind(this));
        
        this.emit("updateState", { type: "loading", message: "Downloading games list..." } as rblxrpLoadingState);
        fetchRemoteConfig().then(() => {
            this.emit("updateState", { type: "loading", message: "Checking..." } as rblxrpLoadingState);
            this.detect();
        }).catch((e) => {
            this.emit("updateState", { type: "loading", message: "Failed to download games list." } as rblxrpLoadingState);
            console.error("[Stat] Couldn't download games list", e);
            notify({
                title: "Game icons failed to load.",
                message: e.message,
                icon: join(__dirname, "..", "..", "ico", "logo.png"),
                contentImage: join(__dirname, "..", "..", "ico", "logo.png")
            });
        });
    }
    detect() {
        try {
            console.log("[Stat] Detecting Roblox...");
            const gameId = getRunningGameId();
            if (gameId) {
                if (this.state.type == "game" && (this.state as rblxrpGameState).gameId == gameId) return undefined;
                const state = { gameId, info: getGameInfo(gameId), type: "game", creationTime: new Date() } as rblxrpGameState;
                setTimeout(async () => {
                    try { state.info = await state.info } catch(e) { console.error("[Stat]",e)}
                },1)
                return this.emit("updateState", state); 
            }
            if (this.lastStudioPing.getTime() + 15000 > Date.now()) {
                if (this.state.type == "studio" && 
                (this.state as rblxrpStudioState).gameId == this.lastStudioState.gameId && 
                (this.state as rblxrpStudioState).providedState.state == this.lastStudioState.state) return undefined;
                return this.emit("updateState", {
                    type: "studio",
                    gameId: this.lastStudioState.gameId,
                    info: getGameInfo(this.lastStudioState.gameId),
                    providedState: this.lastStudioState,
                    creationTime: this.lastStudioPing
                } as rblxrpStudioState);
            }
            if (this.state.type != "none") return this.emit("updateState", { type: "none" } as rblxrpNoneState);
            
            return undefined;
        } catch (error) {
            console.error("[Stat] Couldn't update state", error);
            return this.emit("updateState", { error, type: "error" } as rblxrpErrorState);
        }
    }
    lastStudioState: ProvidedState = { gameId: '', state: "Doing Something", gameName: "A Game" } as ProvidedState;
    lastStudioPing: Date = new Date(0);
    async handleStudioState(req,res) {
        console.log("[HTTP] ", req.url);
        if (!config.studioPresence) return res.status(404).send("Cannot POST " + req.url);
        this.lastStudioPing = new Date();
        let { id, name, action } = req.params;
        this.lastStudioState = {
            gameId: id,
            state: action,
            gameName: name
        } as ProvidedState;
        res.send("OK");
        //this.detect();
    }
    async handleStudioPing(req,res) {
        console.log("[HTTP] ", req.url);
        if (!config.studioPresence) return res.status(404).send("Cannot POST " + req.url);
        this.lastStudioPing = new Date();
        res.send("ok!");
    }
}
export default new StateManager();