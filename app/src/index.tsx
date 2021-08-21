import { QIcon, QSystemTrayIcon, WindowType } from "@nodegui/nodegui";
import { Button, CheckBox, ComboBox, Image, Renderer, Text, View, Window } from "@nodegui/react-nodegui";
import { Component, createRef, RefObject } from "react";
import { resolve } from "path";
import discord from "./discord";
import stateManager, { rblxrpErrorState, rblxrpGameState, rblxrpLoadingState } from "./state/stateManager";
import { RNComboBox } from "@nodegui/react-nodegui/dist/components/ComboBox/RNComboBox";
import { RNCheckBox } from "@nodegui/react-nodegui/dist/components/CheckBox/RNCheckBox";
import config from "./config";

process.env["EZP-DEBUG"] = 'true'

const tray = new QSystemTrayIcon();
const icon = new QIcon(resolve(__dirname, process.platform == "darwin" ? "../ico/logo_white.png" : "../ico/logo.png"));
tray.setIcon(icon);
tray.setToolTip("rblxRP");
tray.addEventListener("activated", () => {
    showConfigScreen = !showConfigScreen;
    setState();
});
tray.show();


let showConfigScreen = true;
let setState: () => void;
let selectedIcon = 3;
const icons = ["logo_shiny", "logo_red", "logo_old", "rblxrp"];

class App extends Component {
    iconRef: RefObject<RNComboBox>;
    cloudProvidedRef: RefObject<RNCheckBox>;
    statusText = `
Current state: Loading.................
Connected to Discord as abcdefghijklmnopqrstuv#0000
`
    constructor(props: unknown) {
        super(props);
        this.iconRef = createRef();
        this.cloudProvidedRef = createRef();
        setState = (() => this.setState({ })).bind(this);
    }

    componentDidMount() {
        setState = (() => this.setState({ })).bind(this);
        this.iconRef.current.setCurrentIndex(icons.indexOf(config.defaultIcon));
        setInterval((() => {
            this.iconRef.current.setCurrentIndex(icons.indexOf(config.defaultIcon));
            this.cloudProvidedRef.current.setChecked(stateManager.connectToRemote);
        }).bind(this), 100);
        stateManager.on("updateState", async() => {
            let status;
            try {
                switch (stateManager.state.type) {
                case "loading": status = (stateManager.state as rblxrpLoadingState).message; break;
                case "error": status = "Error: " + (stateManager.state as rblxrpErrorState).error.message; break;
                case "none": status = "No game detected."; break;
                case "game": status = "Playing " + (await (stateManager.state as rblxrpGameState).info).name; break;
                }
            } catch (e) {
                status = "Error: " + e.message;
            }
            this.statusText = (`Current state: ${status}
${discord.environment ? "Connected to Discord as " + discord.environment.user.username + "#" + discord.environment.user.discriminator : "Not connected to Discord."}`);
            this.setState({});
        });
        discord.on("connected", setState);
    }

    render() {
        return (
            <Window minSize={{width:404,height:300}} maxSize={{width:404,height:300}} windowTitle="rblxRP Settings" windowIcon={icon} visible={showConfigScreen} windowFlags={{ [WindowType.WindowStaysOnTopHint]: true }} >
                <View>
                    {/* Header */}
                    <View style="flex-direction: row;justify-content: 'center'">
                        <Image style="flex: 1;height: 48px;width: 48px;flex-grow:0;" src={ resolve(__dirname, "..","ico","logo.png")}></Image>
                        <Text style="font-size: 36px;font-weight: 900;">rblxRP</Text>
                    </View>

                    {/* Status text */}
                    <Text>
                        {this.statusText}
                    </Text>

                    {/* Default Icon */}
                    <View style="flex-direction: row;">
                        <Text style="font-weight: 700;flex-grow: 1;">
                            Default Icon
                        </Text>
                        <ComboBox ref={this.iconRef} items={[{ text: "Shiny" }, { text: "Red" }, { text: "Old" }, { text: "rblxRP" }]} on={{
                            currentIndexChanged: (event) => {
                                selectedIcon = event;
                                config.defaultIcon = icons[selectedIcon];
                                config.save();
                            }
                        }}></ComboBox>
                    </View>

                    {/* Cloud presence switch  */}
                    <View style="flex-direction: row;">
                        <Text style="font-weight: 700;flex-grow: 1;">
                            Allow games to provide presence data. (coming soon)
                        </Text>
                        <CheckBox ref={this.cloudProvidedRef} enabled={false} on={{
                            stateChanged: (event) => {
                                stateManager.connectToRemote = event == 2;
                            }
                        }}></CheckBox>
                    </View>
                    <Text style="color: #888;text-align:center;">
                        {"Privacy notice: By enabling this feature, you agree to connect to rblxRP servers,\nwhich will recieve your Discord account ID & current Roblox game ID.\nYour Discord account ID will be shared with verify.eryn.io, \nAnonymised play time will be recorded for analytics & product improvement reasons.\nUp to date privacy notice will be kept at https://rblxrp.robins.one"}
                    </Text>


                    {/* Go away button*/}
                    <Button on={{ clicked: () => {
                        showConfigScreen = false;
                        this.setState({});
                    } }}>Minimize to tray</Button>
                    <Text style="color: #888;text-align:center;">
                        Close this window to quit rblxRP.
                    </Text>
                </View>
            </Window>
        );
    }
}

Renderer.render(<App></App>);

// eslint-disable-next-line dot-notation
global["tray"] = tray; // To prevent win from being garbage collected.