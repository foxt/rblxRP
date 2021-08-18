import { spawnSync } from "child_process";

// ps-node could be used here, but it's slow on Windows & unreliable on macOS ¯\_(ツ)_/¯
const getScriptUrlUNIX = () => spawnSync("ps", ["exo", "pid,args"]).stdout
    .toString().replace("-j ", "-scriptURL ")
    // split each individual process
    .split("\n")
    // filter for RobloxPlayer only
    .filter((e) => e.includes("RobloxPlayer") && e.includes("-scriptURL") && !e.includes("--crashHandler"))
    // split pid & arguments
    .map((e) => e.split(" "))
    // sometimes it has padding, this removes the first element until its a number
    .map((l) => {
        while (isNaN(parseInt(l[0]))) {
            l.shift();
        }
        return l;
    })
    // return as js object
    .map((e) => e.join(" ").split("-scriptURL ")[1].split(" ")[0])[0];

const getScriptUrlWin = () => spawnSync("wmic process where \"Name='RobloxPlayerBeta.exe'\" get CommandLine /format:csv")
    .toString().replace("-j ", "-scriptURL ")
    // split each individual process
    .split("\n")
    // filter for RobloxPlayer only
    .filter((e) => e.includes("RobloxPlayer") && e.includes("-scriptURL") && !e.includes("--crashHandler"))
    .map((e) => e.split("-scriptURL ")[1].split(" ")[0].replace(/&amp;/g, "&"))[0];



export const getScriptUrl = process.platform == "win32" ? getScriptUrlWin : getScriptUrlUNIX;

export function getRunningGameId():string {
    const scriptUrl = getScriptUrl();
    return scriptUrl && scriptUrl.split("placeId=")[1].split("&")[0];
}
