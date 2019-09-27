const ps = require("ps-node");

module.exports.getProcesses = function(args) {
    return new Promise(function(a,r) {
        ps.lookup(args,function(err,data) {
            if (err) {r(err)}
            else {a(data)}
        })
    })
}

module.exports.getScriptUrl = function(arguments) {
    for (var argument of arguments) {
        if (argument.startsWith("https://") && argument.includes("placeId=")) {
            return argument
        }
    }
    return false
} 