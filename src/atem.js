/*
    This class is very similar to atem-connection AtemClient class
    but this communicates via websocket to node server
*/
const defaultState = require('./state.constellation.json');

function deepSet(obj, path, value) {
    for (var i = 0, path = path.split('.'), len = path.length - 1; i < len; i++) {
        if (Array.isArray(obj)) {
            obj = obj[+path[i]];
        } else {
            obj = obj[path[i]];
        }
    };
    return obj[path[i]] = value;
};


class AtemClient {
    constructor(websocketUrl) {
        this.state = defaultState;
        this.visibleInputs = this.getVisibleInputs()
        this.websocketUrl = websocketUrl;
        this.reconnect()
    }

    reconnect() {
        this.websocket = new WebSocket(this.websocketUrl);
        this.websocket.addEventListener("open", function (event) {
            console.log("Websocket opened");
            this.intervalID = clearTimeout(this.intervalID);
            // Svelte update connected status
            this.websocket = this.websocket;
        });
        this.websocket.addEventListener("message", (event) => {
            const { path, state } = JSON.parse(event.data);
            console.log(path, state);
            deepSet(this, path, state)
            if (path === 'state' || path === 'state.inputs' || path == 'connected') {
                this.visibleInputs = this.getVisibleInputs();
            }
            this = this;
        });
        this.websocket.addEventListener("error", () => {
            console.log("Websocket error");
            this.websocket.close();
            this.intervalID = setTimeout(this.reconnect, 1000);
            // Svelte update connected status
            this.websocket = this.websocket;
        });
        this.websocket.addEventListener("close", () => {
            console.log("Websocket closed");
            this.intervalID = setTimeout(this.reconnect, 1000);
            // Svelte update connected status
            this.websocket = this.websocket;
        });
    }

    sendMessage(data) {
        if (this.websocket.readyState == WebSocket.OPEN) {
            const message = JSON.stringify(data);
            // console.log('sendMessage', message);
            this.websocket.send(message);
        } else {
            console.warn('Websocket is closed. Cannot send message.')
        }
    }

    getVisibleInputs() {
        const visibleInputs = [];
        let input;
        let meInputs;

        if (!this.state.info.capabilities)
            return visibleInputs;

        for (let me = this.state.info.capabilities.MEs || 0; me >= 0; me--) {
            const bitME = 1 << me;
            visibleInputs[me] = meInputs = [];

            // standard inputs
            for (let i = 1; i <= 10; i++) {
                input = this.state.inputs[i];
                if (input && input.meAvailability & bitME) {
                    meInputs.push(i);
                } else {
                    break;
                }
            }
            // Black
            input = this.state.inputs[0];
            if (input && input.meAvailability & bitME) {
                meInputs.push(0);
            }
            // MixEffects
            for (let i = 10010; i < 11000; i += 10) {
                input = this.state.inputs[i];
                if (input && input.meAvailability & bitME) {
                    meInputs.push(i);
                } else {
                    break;
                }
            }
            // Super Sources
            for (let i = 6000; i < 6010; i++) {
                input = this.state.inputs[i];
                if (input && input.meAvailability & bitME) {
                    meInputs.push(i);
                } else {
                    break;
                }
            }
            // Colors
            for (let i = 2001; i < 3000; i++) {
                input = this.state.inputs[i];
                if (input && input.meAvailability & bitME) {
                    meInputs.push(i);
                } else {
                    break;
                }
            }
            // Color Bars
            input = this.state.inputs[1000];
            if (input && input.meAvailability & bitME) {
                meInputs.push(1000);
            }
            // Media Players
            for (let i = 3010; i < 4000; i += 10) {
                input = this.state.inputs[i];
                if (input && input.meAvailability & bitME) {
                    meInputs.push(i);
                } else {
                    break;
                }
            }
        }

        return visibleInputs;
    }

    changeProgramInput(source, mixEffect) {
        this.sendMessage({ method: 'ProgramInputCommand', params: { source, mixEffect } })
    }
    changePreviewInput(source, mixEffect) {
        this.sendMessage({ method: 'PreviewInputCommand', params: { source, mixEffect } })
    }
    autoTransition(mixEffect) {
        this.sendMessage({ method: 'AutoTransitionCommand', params: { mixEffect } });
    }
    cutTransition(mixEffect) {
        this.sendMessage({ method: 'CutCommand', params: { mixEffect } });
    }
    fadeToBlack(mixEffect) {
        this.sendMessage({ method: 'FadeToBlackAutoCommand', params: { mixEffect } });
    }

    previewTransition(mixEffect) {
        const preview = !this.state.video.ME[mixEffect].transitionPreview;
        this.sendMessage({ method: 'PreviewTransitionCommand', params: { preview, mixEffect } });
    }

    setTransitionPosition(handlePosition, mixEffect) {
        this.sendMessage({ method: 'TransitionPositionCommand', params: { mixEffect, handlePosition } });
    }

    setTransitionStyle(style, mixEffect) {
        this.sendMessage({ method: 'TransitionPropertiesCommand', params: { style, mixEffect } });
    }

    setDownstreamKeyTie(tie, downstreamKeyerId) {
        this.sendMessage({ method: 'DownstreamKeyTieCommand', params: { downstreamKeyerId, tie } });
    };

    setDownstreamKeyOnAir(onAir, downstreamKeyerId) {
        this.sendMessage({ method: 'DownstreamKeyOnAirCommand', params: { downstreamKeyerId, onAir } });
    };

    autoDownstreamKey(downstreamKeyerId, isTowardsOnAir) {
        this.sendMessage({ method: 'DownstreamKeyAutoCommand', params: { downstreamKeyerId, isTowardsOnAir } });
    }

    toggleUpstreamKeyNextBackground(ME) {
        // TODO
        const status = !this.state.video.ME[ME].upstreamKeyNextBackground;
        this.sendMessage({ method: 'changeUpstreamKeyNextBackground', params: { status } });
    };

    setUpstreamKeyerFly(flyEnabled, mixEffect, upstreamKeyerId) {
        this.sendMessage({ method: 'MixEffectKeyTypeSetCommand', params: { flyEnabled, mixEffect, upstreamKeyerId } });
    };

    setUpstreamKeyerOnAir(onAir, mixEffect, upstreamKeyerId) {
        this.sendMessage({
            method: 'MixEffectKeyOnAirCommand',
            params: { mixEffect, upstreamKeyerId, onAir }
        });
    };

    macroRun(index) {
        console.log("macroRun ", index);
        this.sendMessage({ method: 'MacroActionCommand', params: { index, action: 0 } });
    }
    macroStop() {
        console.log("macroStop");
        this.sendMessage({ method: 'MacroActionCommand', params: { index: 0, action: 1 } });
    }
    macroStopRecord() {
        console.log("macroStopRecord");
        this.sendMessage({ method: 'MacroActionCommand', params: { index: 0, action: 2 } });
    }

    uploadMediaFile(file, index) {
        let img, reader;
        let atem = this;
        let [width, height] = getResolution(this.state.settings.videoMode)
        if (file.type.match(/image.*/)) {
            img = document.querySelectorAll('.media-thumb img')[index];
            reader = new FileReader();
            reader.onload = function (e) {
                img.onload = function () {
                    let canvas, ctx;
                    canvas = document.createElement("canvas");
                    canvas.width = width
                    canvas.height = height
                    ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, width, height);
                    console.log('drawing Image', width, height)
                    // upload to server
                    atem.sendMessage({
                        method: "uploadMedia",
                        params: {
                            device: atem.state.device,
                            index: index || 0,
                            name: file.name,
                            media: canvas.toDataURL("image/png")
                        }
                    });
                }
                img.src = e.target.result;
            }
            reader.readAsDataURL(file);
        } else {
            alert('This file is not an image.');
        }
    }
}

function getResolution(videoMode) {
    const PAL = [720, 576];
    const NTSC = [640, 480];
    const HD = [1280, 720];
    const FHD = [1920, 1080];
    const UHD = [3840, 2160];
    const enumToResolution = [
        NTSC, PAL, NTSC, PAL,
        HD, HD,
        FHD, FHD, FHD, FHD, FHD, FHD, FHD, FHD,
        UHD, UHD, UHD, UHD,
        UHD, UHD
    ];
    return enumToResolution[videoMode];
}

module.exports = { AtemClient };
