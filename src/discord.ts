import { Client } from "discord-rpc";
import config from "./config";
import { GameInfo } from "./state/providers/gameInfo";
import stateManager, { rblxrpGameState, rblxrpState } from "./state/stateManager";


class DiscordRpcManager extends Client {
    cooldown = false;
    queuedActivity = false;
    constructor() {
        super({ transport: "ipc" });
        this.login({ clientId: "626092891667824688" });
        this.on("ready", () => {
            console.log("[DRPC] ", this.user.username, " is ready!");
        });
        stateManager.on("updateState", this.updateState.bind(this));
    }
    async updateState(state: rblxrpState) {
        if (this.cooldown) {
            this.queuedActivity = true;
            return;
        }
        this.cooldown = true;
        try {
            if (state.type == "game") {
                await this.activitySet(state as rblxrpGameState);
            } else {
                this.clearActivity();
            }
        } catch (e) {
            setTimeout(() => this.updateState(state), 1000);
        }
        setTimeout((() => {
            this.cooldown = false;
            if (this.queuedActivity) {
                this.queuedActivity = false;
                this.updateState(stateManager.state);
            }
        }).bind(this), 15000);
    }
    async activitySet(state: rblxrpGameState) {
        let info: GameInfo = { name: state.gameId, by: "A Roblox Developer" };
        try {
            info = await state.info;
        } catch (e) {}
        this.setActivity({
            state: state.providedState ? state.providedState.state : "by " + info.by,
            details: info.name,
            startTimestamp: Date.now(),
            largeImageKey: info.iconKey || config.defaultIcon,
            smallImageKey: "rblxrp",
            smallImageText: "http://rblxrp.robins.one",
            instance: true,
            partyId: state.gameId,
            buttons: [
                {
                    label: "► Play",
                    url: "https://roblox.com/games/" + state.gameId
                }
            ]
        });
    }
}

export default new DiscordRpcManager();