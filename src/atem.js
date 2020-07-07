/*
    This class is very similar to atem-connection Atem class
    but this communicates via websocket to node server
*/
var defaultState = require('./state.default.json');

class Atem {
    constructor() {
        this.state = defaultState;
        this.visibleInputs = [
        /*   INPUTS,     BLK,BARS, COLORS,   MEDIA PLAYERS  */
            [1,2,3,4,5,6, 0, 1000, 2001,2002, 3010,3020],
            [1,2,3,4,5,6, 0, 1000, 2001,2002, 3010,3020],
            [1,2,3,4,5,6, 0, 1000, 2001,2002, 3010,3020],
            [1,2,3,4,5,6, 0, 1000, 2001,2002, 3010,3020],
        ];
    }

    setWebsocket(websocket) {
        this.websocket = websocket;
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

/*
    get visibleInputs() {
        let visibleInputs = [];
        // update input
        for (let input in this.state.inputs) {
            input.id = id;
            input.device = this.state.device;
            input.input = id;
        }
        // standard inputs
        for (let i = 1; i < 10; i++) {
            if (this.state.inputs[i]) {
                visibleInputs.push(this.state.inputs[i]);
            } else {
                break;
            }
        }
        // Black
        if (this.state.inputs[0]) {
            visibleInputs.push(this.state.inputs[0]);
        }
        // Colors
        for (let i = 2001; i < 3000; i++) {
            if (this.state.inputs[i]) {
                visibleInputs.push(this.state.inputs[i]);
            } else {
                break;
            }
        }
        // Color Bars
        if (this.state.inputs[1000]) {
            visibleInputs.push(this.state.inputs[1000]);
        }
        // Media Players
        for (let i = 3010; i < 4000; i += 10) {
            if (this.state.inputs[i]) {
                visibleInputs.push(this.state.inputs[id]);
            } else {
                break;
            }
        }
        return visibleInputs;
    }
*/

    changeProgramInput(source, mixEffect) {
        this.sendMessage({method: 'ProgramInputCommand', params: { source, mixEffect } })
    }
    changePreviewInput(source, mixEffect) {
        this.sendMessage({method: 'PreviewInputCommand', params: { source, mixEffect } })
    }
    autoTransition(mixEffect) {
        this.sendMessage({method: 'AutoTransitionCommand', params: { mixEffect } });
    }
    cutTransition(mixEffect) {
        this.sendMessage({method: 'CutCommand', params: { mixEffect } });
    }
    fadeToBlack(mixEffect) {
        this.sendMessage({method: 'FadeToBlackAutoCommand', params: { mixEffect } });
    }

    previewTransition(mixEffect) {
        const preview = !this.state.video.ME[mixEffect].transitionPreview;
        this.sendMessage({method: 'PreviewTransitionCommand', params: { preview, mixEffect } });
    }

    setTransitionPosition(handlePosition, mixEffect) {
        this.sendMessage({method: 'TransitionPositionCommand', params: {mixEffect, handlePosition} });
    }

    setTransitionStyle(style, mixEffect) {
        this.sendMessage({method: 'TransitionPropertiesCommand', params: {style, mixEffect} });
    }

    setDownstreamKeyTie(tie, downstreamKeyerId) {
        this.sendMessage({method: 'DownstreamKeyTieCommand', params: {downstreamKeyerId, tie}});
    };

    setDownstreamKeyOnAir(onAir, downstreamKeyerId) {
        this.sendMessage({method: 'DownstreamKeyOnAirCommand', params: {downstreamKeyerId, onAir}});
    };

    autoDownstreamKey(downstreamKeyerId, isTowardsOnAir) {
        this.sendMessage({method: 'DownstreamKeyAutoCommand', params: {downstreamKeyerId, isTowardsOnAir} });
    }

    toggleUpstreamKeyNextBackground(ME) {
        // TODO
        const status = !this.state.video.ME[ME].upstreamKeyNextBackground;
        this.sendMessage({method: 'changeUpstreamKeyNextBackground', params: { status } });
    };

    setUpstreamKeyerFly(flyEnabled, mixEffect, upstreamKeyerId) {
        this.sendMessage({method: 'MixEffectKeyTypeSetCommand', params: { flyEnabled, mixEffect, upstreamKeyerId } });
    };

    setUpstreamKeyerOnAir(onAir, mixEffect, upstreamKeyerId) {
        this.sendMessage({
            method: 'MixEffectKeyOnAirCommand',
            params: { mixEffect, upstreamKeyerId, onAir }
        });
    };

    macroRun(index) {
        console.log("macroRun ", index);
        this.sendMessage({method: 'MacroActionCommand', params: {index, action: 0} });
    }
    macroStop() {
        console.log("macroStop");
        this.sendMessage({method: 'MacroActionCommand', params: {index: 0, action: 1} });
    }
    macroStopRecord() {
        console.log("macroStopRecord");
        this.sendMessage({method: 'MacroActionCommand', params: {index: 0, action: 2} });
    }

    uploadMediaFile(file, index) {
        let img, reader;
        let atem = this;
        let [width, height] = getResolution(this.state.settings.videoMode)
        if (file.type.match(/image.*/)) {
          img = document.querySelectorAll('.media-thumb img')[index];
          reader = new FileReader();
          reader.onload = function(e) {
            img.onload = function() {
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

module.exports = { Atem };
