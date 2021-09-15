import { readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

class ConfigManager {
    defaultIcon = "logo_shiny"
    studioPresence = false
    constructor() {
        try {
            const config = JSON.parse(readFileSync(join(homedir(), ".rblxrp.json")).toString());
            console.log("[CNFG]",config);
            this.defaultIcon = config.defaultIcon || 'logo_shiny';
            this.studioPresence = config.studioPresence  || false;
        } catch (e) {console.error("[CNFG]",e);}
    }
    save() {
        const config = {
            defaultIcon: this.defaultIcon,
            studioPresence: this.studioPresence
        };
        writeFileSync(join(homedir(), ".rblxrp.json"), JSON.stringify(config));
    }
}
export default new ConfigManager();