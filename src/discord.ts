import { EasyPresence } from "easy-presence";
import config from "./config";
import { GameInfo } from "./state/providers/gameInfo";
import stateManager, { rblxrpGameState, rblxrpState, rblxrpStateWithGame, rblxrpStudioState } from "./state/stateManager";


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
            case "studio":
                const s = state as rblxrpStateWithGame
                let info: GameInfo = { 
                    name: s.type == "studio" ? 
                            (!s.providedState.gameName.match(/Place\d+$/) ? s.providedState.gameName : 'Working on a game') : 
                            "Playing a game", 
                    by: "a Roblox developer" 
                };
                try {
                    const i = await s.info;
                    console.log(i);
                    if (i) info = i
                } catch (e) {}
                presence =  {
                    state: s.providedState ? s.providedState.state : "by " + info.by,
                    details: info.name,
                    timestamps: {
                        start: Date.now(),
                    },
                    assets: {
                        large_image: state.type == 'studio' ? 'rstudio' : info.iconKey || config.defaultIcon,
                        small_image: "rblxrp",
                        small_text: "http://rblxrp.xyz",
                    },
                    instance: true,
                    party: {id:  state.type + s.gameId},
                    buttons: s.gameId == '0' ? undefined : [
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