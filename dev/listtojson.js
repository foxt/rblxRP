// This file develops a list of games from a list of IDs.
// See https://gist.githubusercontent.com/theLMGN/3799b5cb7b0328be7a13860e46832b0e/raw/b5bc45677d12ef9f7131f82249c531db6a8d7d71/rblxrp_config.json ["games"] for an example

const fetch = require("node-fetch");
let list = [];

let cache = {};
async function a() {
    for (let asset of list) {
        console.log("Getting", a);
        let apiResponse = await fetch("https://api.roblox.com/marketplace/productinfo?assetId=" + asset);
        if (!apiResponse.ok) { throw new Error(apiResponse); }
        let j = await apiResponse.json();
        let obj = {
            name: j.Name,
            by: j.Creator.Name,
            iconkey: asset
        };
        console.log("   ", obj.name, "by", obj.by);
        cache[asset] = obj;
    }
    console.log(JSON.stringify(cache));
}
a();