import { readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

class ConfigManager {
    defaultIcon = "logo_shiny"
    constructor() {
        try {
            const config = JSON.parse(readFileSync(join(homedir(), ".rblxrp.json")).toString());
            console.log("[CNFG]",config);
            this.defaultIcon = config.defaultIcon;
        } catch (e) {console.error("[CNFG]",e);}
    }
    save() {
        const config = {
            defaultIcon: this.defaultIcon
        };
        writeFileSync(join(homedir(), ".rblxrp.json"), JSON.stringify(config));
    }
}
export default new ConfigManager();