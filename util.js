const ps = require("ps-node");
const activeWindow = require("active-window");

function getProcesses(args) {
    return new Promise((a, r) => ps.lookup(args, (err, data) => (err ? r : a)(data)));
}

function getScriptUrl(arg) {
    for (let argument of arg) {
        if (argument.startsWith("https://") && argument.includes("placeId=")) {
            return argument;
        }
    }
    return false;
}
function getActiveWindow() {
    return new Promise((a, r) => activeWindow.getActiveWindow(a, 0, 0));
}

module.exports = { getProcesses, getScriptUrl, getActiveWindow };