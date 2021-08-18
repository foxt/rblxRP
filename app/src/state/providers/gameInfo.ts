import fetch from "node-fetch";

export interface GameInfo {
    name: string;
    by: string;
    iconKey?: string;
}

const gameInfoCache:Map<string, Promise<GameInfo> | GameInfo> = new Map();

export function getGameInfo(gameId:string):Promise<GameInfo> | GameInfo {
    console.log("[GIP ] Getting game info for", gameId);
    if (gameInfoCache.get(gameId)) return gameInfoCache.get(gameId);

    const promise = new Promise<GameInfo>(async(resolve, reject) => {
        try {
            console.log("[GIP ] Fetching info for", gameId);
            // https://games.roblox.com/v1/games/multiget-place-details?placeIds= requires authentication
            // crying
            const universesResponse = await fetch("https://api.roblox.com/universes/get-universe-containing-place?placeid=" + gameId);
            if (!universesResponse.ok) throw new Error(universesResponse.status + " " + universesResponse.statusText);
            const universesJson = await universesResponse.json();
            if (!universesJson.UniverseId) throw new Error("no json.UniverseId");

            const gamesResponse = await fetch("https://games.roblox.com/v1/games?universeIds=" + universesJson.UniverseId);
            if (!gamesResponse.ok) throw new Error(gamesResponse.status + " " + gamesResponse.statusText);
            const gamesJson = await gamesResponse.json();
            if (!gamesJson.data || !gamesJson.data[0]) throw new Error("no json.data[0]");

            return resolve({ name: gamesJson.data[0].name, by: gamesJson.data[0].creator.name });
        } catch (e) {
            console.error("[GIP ] Failed to get game info", e);
            gameInfoCache.delete(gameId);
            return reject(e);
        }
    });
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