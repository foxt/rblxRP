import fetch from "node-fetch";

export interface GameInfo {
    name: string;
    by: string;
    iconKey?: string;
}

const gameInfoCache:Map<string, Promise<void | GameInfo> | GameInfo> = new Map();

async function getUniverseId(gameId: string) {
    try {
        const universesResponse = await fetch("https://api.roblox.com/universes/get-universe-containing-place?placeid=" + gameId);
        if (!universesResponse.ok) return gameId;
        const universesJson = await universesResponse.json();
        if (!universesJson.UniverseId) return gameId;
        return universesJson.UniverseId;
    } catch(e) { return gameId; }
}

export function getGameInfo(gameId:string):Promise<void | GameInfo> | GameInfo   {
    console.log("[GIP ] Getting game info for", gameId);
    if (gameInfoCache.get(gameId)) return gameInfoCache.get(gameId);

    const promise = new Promise<GameInfo>(async(resolve, reject) => {
        try {
            console.log("[GIP ] Fetching info for", gameId);
            if (!gameId || gameId == '0') return reject("no game id!")
            // https://games.roblox.com/v1/games/multiget-place-details?placeIds= requires authentication
            // crying
            const universeId = await getUniverseId(gameId);
            console.log("[GIP ]     Universe:", universeId);

            const gamesResponse = await fetch("https://games.roblox.com/v1/games?universeIds=" + universeId);
            if (!gamesResponse.ok) return reject(gamesResponse.status + " " + gamesResponse.statusText);
            const gamesJson = await gamesResponse.json();
            if (!gamesJson.data || !gamesJson.data[0]) return reject("no json.data[0]");
            console.log("[GIP ]     Game:", gamesJson.data[0].name);
            console.log ("[GIP ]    Retrieving icon for", universeId);
            var data:GameInfo = { name: gamesJson.data[0].name, by: gamesJson.data[0].creator.name };
            try {
                const iconResponse = await fetch("https://thumbnails.roblox.com/v1/games/icons?universeIds=" + universeId + "&size=512x512&format=Png&isCircular=false");
                if (!iconResponse.ok) throw iconResponse.status + " " + iconResponse.statusText;
                const iconJson = await iconResponse.json();
                if (!iconJson.data || !iconJson.data[0] || !iconJson.data[0].imageUrl) throw "no json.data[0]";
                data.iconKey = iconJson.data[0].imageUrl;                
            } catch(e) {
                console.error("[GIP ]     Error fetching icon:", e);
            }
            resolve(data);

        } catch (e) {
            console.error("[GIP ] Failed to get game info", e);
            gameInfoCache.delete(gameId);
            return reject(e);
        }
    }).catch(()=>{});
    gameInfoCache.set(gameId, promise);
    return promise;
}

export async function fetchRemoteConfig(): Promise<void> {
    console.log("[GIP ] Fetching remote config");
    const response = await fetch("https://gist.githubusercontent.com/theLMGN/3799b5cb7b0328be7a13860e46832b0e/raw/rblxrp_config.json");
    if (!response.ok) throw new Error(response.status + " " + response.statusText);
    const json = await response.json();
    for (const k in json.games) { gameInfoCache.set(k, json.games[k]); }
    console.log("[GIP ] Cache is now " + gameInfoCache.size + " games big");
}