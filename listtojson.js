// This file develops a list of games from a list of IDs.
// See https://gist.githubusercontent.com/theLMGN/3799b5cb7b0328be7a13860e46832b0e/raw/b5bc45677d12ef9f7131f82249c531db6a8d7d71/rblxrp_config.json ["games"] for an example

const fetch = require("node-fetch");
var list = []

var cache = {}
async function a() {
    for (var a of list) {
        console.log("Getting",a)
        var apiResponse = await fetch("https://api.roblox.com/marketplace/productinfo?assetId=" + a)
        if (!apiResponse.ok) {throw new Error(apiResponse)}
        var j = await apiResponse.json()
        var obj = {
            name: j.Name,
            by: j.Creator.Name,
            iconkey: a
        }
        console.log("   ", obj.name,"by",obj.by)
        cache[a] = obj
    }
    console.log(JSON.stringify(cache))
}
a()