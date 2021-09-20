import { EasyPresence } from "easy-presence";
import config from "./config";
import { GameInfo } from "./state/providers/gameInfo";
import stateManager, { rblxrpGameState, rblxrpState, rblxrpStudioState } from "./state/stateManager";


class DiscordRpcManager extends EasyPresence {
    constructor() {
        super('626092891667824688');
        this.on("connected", () => {
            console.log("[DRPC] ", this.environment.user.username, " is ready!");
        });
        stateManager.on("updateState", this.updateState.bind(this));
    }
    async updateState(state: rblxrpState) {
        var presence = undefined;
        switch (state.type) {
            case "game":
                const s = state as rblxrpGameState
                let info: GameInfo = { name: s.gameId || state.type, by: "A Roblox Developer" };
                try {
                    info = await s.info;
                } catch (e) {}
                presence =  {
                    state: s.providedState ? s.providedState.state : "by " + info.by,
                    details: info.name,
                    timestamps: {
                        start: Date.now(),
                    },
                    assets: {
                        large_image: info.iconKey || config.defaultIcon,
                        small_image: "rblxrp",
                        small_text: "http://rblxrp.xyz",
                    },
                    instance: true,
                    //party: {id: s.gameId},
                    buttons: [
                        {
                            label: "► Play",
                            url: "https://roblox.com/games/" + s.gameId
                        }
                    ]
                };
                break;
            case "studio":
                const studiostate = state as rblxrpStudioState
                presence =  {
                    state: studiostate.action,
                    details: studiostate.game,
                    timestamps: {
                        start: Date.now(),
                    },
                    assets: {
                        large_image: 'studio',
                        small_image: "rblxrp",
                        small_text: "http://rblxrp.xyz",
                    },
                    instance: true,
                    party: {id: s.gameId},
                    buttons: [
                        {
                            label: "► Play",
                            url: "https://roblox.com/games/" + s.gameId
                        }
                    ]
                };
                break;
        }
        this.setActivity(presence);
    }
}

export default new DiscordRpcManager();