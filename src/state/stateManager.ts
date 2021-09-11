import { info } from "console";
import EventEmitter from "events";
import { notify } from "node-notifier";
import { join } from "path";
import { getRunningGameId } from "./providers/gameDetection";
import { fetchRemoteConfig, GameInfo, getGameInfo } from "./providers/gameInfo";

export interface ProvidedState {
    gameId: string,
    iconText: string,
    iconKey: string,
    state: string,
}

export interface rblxrpState {
    type: "none" | "game" | "error" | "loading"
}
export interface rblxrpNoneState extends rblxrpState { type: "none" }

export interface rblxrpErrorState extends rblxrpState { type: "error", error: Error }
export interface rblxrpLoadingState extends rblxrpState { type: "loading", message: string }

export interface rblxrpGameState extends rblxrpState {
    type: "game",
    gameId: string,
    info: Promise<GameInfo> | GameInfo
    providedState?: ProvidedState,
    creationTime: Date
}

class StateManager extends EventEmitter {
    connectToRemote = false;
    state: rblxrpState = { type: "loading", message: "Loading..." } as rblxrpLoadingState;
    constructor() {
        super();
        // eslint-disable-next-line no-return-assign
        this.on("updateState", (s: rblxrpState) => this.state = s);
        setInterval(this.detect.bind(this), 15000);


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
            if (gameId && !(this.state.type == "game" && (this.state as rblxrpGameState).gameId == gameId)) { 
                const state = { gameId, info: getGameInfo(gameId), type: "game", creationTime: new Date() } as rblxrpGameState;
                setTimeout(async () => {
                    try { state.info = await state.info } catch(e) { console.error("[Stat]",e)}
                },1)
                return this.emit("updateState", state); 
            }
            if (!gameId && this.state.type != "none") return this.emit("updateState", { type: "none" } as rblxrpNoneState);

            return undefined;
        } catch (error) {
            console.error("[Stat] Couldn't update state", error);
            return this.emit("updateState", { error, type: "error" } as rblxrpErrorState);
        }
    }
}
export default new StateManager();