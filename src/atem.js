/*
    This class is very similar to node-applest-atem ATEM class
    but this communicates via websocket to node server
    These two ATEM classes could be joined in two ways:
    - constructor decides if it communicates via udp socket to atem or websocket to node
    - server could relay BMC protocol commands to websocket messages
*/

class ATEM {
    constructor() {
        this._state = {
            "topology": {
                "numberOfMEs": 1,
                "numberOfSources": 18,
                "numberOfColorGenerators": 2,
                "numberOfAUXs": 0,
                "numberOfDownstreamKeys": 0,
                "numberOfStingers": 2,
                "numberOfDVEs": 0,
                "numberOfSuperSources": 4
            },
            "tallys": [2, 0, 0, 0, 0, 0],
            "channels": {
                "0": {
                    "name": "Black",
                    "label": "Blk",
                    "id": "0",
                    "device": 0,
                    "input": "0"
                },
                "1": {
                    "name": "Cam 1",
                    "label": "CAM1",
                    "id": "1",
                    "device": 0,
                    "input": "1"
                },
                "2": {
                    "name": "Cam 2",
                    "label": "CAM2",
                    "id": "2",
                    "device": 0,
                    "input": "2"
                },
                "3": {
                    "name": "Cam 3",
                    "label": "CAM3",
                    "id": "3",
                    "device": 0,
                    "input": "3"
                },
                "4": {
                    "name": "Cam 4",
                    "label": "CAM4",
                    "id": "4",
                    "device": 0,
                    "input": "4"
                },
                "5": {
                    "name": "Cam 5",
                    "label": "CAM5",
                    "id": "5",
                    "device": 0,
                    "input": "5"
                },
                "6": {
                    "name": "Cam 6",
                    "label": "CAM6",
                    "id": "6",
                    "device": 0,
                    "input": "6"
                },
                "1000": {
                    "name": "Color Bars",
                    "label": "Bars",
                    "id": "1000",
                    "device": 0,
                    "input": "1000"
                },
                "2001": {
                    "name": "Color 1",
                    "label": "Col1",
                    "id": "2001",
                    "device": 0,
                    "input": "2001"
                },
                "2002": {
                    "name": "Color 2",
                    "label": "Col2",
                    "id": "2002",
                    "device": 0,
                    "input": "2002"
                },
                "3010": {
                    "name": "Media Player 1",
                    "label": "MP1",
                    "id": "3010",
                    "device": 0,
                    "input": "3010"
                },
                "3011": {
                    "name": "Media 1 Key",
                    "label": "MP1K",
                    "id": "3011",
                    "device": 0,
                    "input": "3011"
                },
                "3020": {
                    "name": "Media Player 2",
                    "label": "MP2",
                    "id": "3020",
                    "device": 0,
                    "input": "3020"
                },
                "3021": {
                    "name": "Media Player 2 Key",
                    "label": "MP2K",
                    "id": "3021",
                    "device": 0,
                    "input": "3021"
                },
                "7001": {
                    "name": "Clean Feed 1",
                    "label": "Cfd1",
                    "id": "7001",
                    "device": 0,
                    "input": "7001"
                },
                "7002": {
                    "name": "Clean Feed 2",
                    "label": "Cfd2",
                    "id": "7002",
                    "device": 0,
                    "input": "7002"
                },
                "10010": {
                    "name": "Program",
                    "label": "Pgm",
                    "id": "10010",
                    "device": 0,
                    "input": "10010"
                },
                "10011": {
                    "name": "Preview",
                    "label": "Pvw",
                    "id": "10011",
                    "device": 0,
                    "input": "10011"
                }
            },
            "video": {
                "ME": [
                    {
                        "upstreamKeyState": [false],
                        "upstreamKeyNextState": [false],
                        "numberOfKeyers": 1,
                        "programInput": 3010,
                        "previewInput": 1,
                        "transitionStyle": 0,
                        "upstreamKeyNextBackground": true,
                        "transitionPreview": false,
                        "transitionPosition": 0,
                        "transitionFrameCount": 25,
                        "fadeToBlack": false
                    }
                ],
                "downstreamKeyOn": [false, false],
                "downstreamKeyTie": [false, false],
                "auxs": {},
                "modes": {
                    0: '525i59.94 NTSC',
                    1: '625i 50 PAL',
                    2: '525i59.94 NTSC 16:9',
                    3: '625i 50 PAL 16:9',
                    4: '720p50',
                    5: '720p59.94',
                    6: '1080i50',
                    7: '1080i59.94',
                    8: '1080p23.98',
                    9: '1080p24',
                    10: '1080p25',
                    11: '1080p29.97',
                    12: '1080p50',
                    13: '1080p59.94',
                    14: '2160p23.98',
                    15: '2160p24',
                    16: '2160p25',
                    17: '2160p29.97',
                }
            },
            "audio": {
                "hasMonitor": false,
                "numberOfChannels": 0,
                "channels": {
                    "1": {
                        "on": false,
                        "afv": false,
                        "gain": 0.5011853596610636,
                        "rawGain": 32768,
                        "rawPan": 0
                    },
                    "2": {
                        "on": false,
                        "afv": false,
                        "gain": 0.5011853596610636,
                        "rawGain": 32768,
                        "rawPan": 0
                    },
                    "3": {
                        "on": false,
                        "afv": false,
                        "gain": 0.5011853596610636,
                        "rawGain": 32768,
                        "rawPan": 0
                    },
                    "4": {
                        "on": false,
                        "afv": false,
                        "gain": 0.5011853596610636,
                        "rawGain": 32768,
                        "rawPan": 0
                    },
                    "5": {
                        "on": false,
                        "afv": false,
                        "gain": 0.5011853596610636,
                        "rawGain": 32768,
                        "rawPan": 0
                    },
                    "6": {
                        "on": false,
                        "afv": false,
                        "gain": 0.5011853596610636,
                        "rawGain": 32768,
                        "rawPan": 0
                    },
                    "1101": {
                        "on": true,
                        "afv": false,
                        "gain": 0.5011853596610636,
                        "rawGain": 32768,
                        "rawPan": 0
                    }
                },
                "master": {
                    "afv": false,
                    "gain": 0.5011853596610636,
                    "rawGain": 32768
                }
            },
            "device": 0,
            "_ver0": 2,
            "_ver1": 27,
            "_pin": "ATEM Television Studio",
            "model": 1
        }
        this.updateVisibleChannels();
    }

    get state() {
        return this._state;
    }
    set state(state) {
        this._state = state;
        this.updateVisibleChannels();
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

    updateVisibleChannels() {
        this.state.visibleChannels = [];
        for (var id in this.state.channels) {
            const channel = this.state.channels[id];
            channel.id = id;
            channel.device = this.state.device;
            channel.input = id;
        }
        // standard inputs
        for (var id = 1; id < 10; id++) {
            if (this.state.channels[id]) {
                this.state.visibleChannels.push(this.state.channels[id]);
            } else {
                break;
            }
        }
        // Black
        if (this.state.channels[0]) {
            this.state.visibleChannels.push(this.state.channels[0]);
        }
        // Colors
        for (var id = 2001; id < 3000; id++) {
            if (this.state.channels[id]) {
                this.state.visibleChannels.push(this.state.channels[id]);
            } else {
                break;
            }
        }
        // Color Bars
        if (this.state.channels[1000]) {
            this.state.visibleChannels.push(this.state.channels[1000]);
        }
        // Media Players
        for (var id = 3010; id < 4000; id += 10) {
            if (this.state.channels[id]) {
                this.state.visibleChannels.push(this.state.channels[id]);
            } else {
                break;
            }
        }
    }

    isProgramChannel(channel) {
        return this.state.video.ME[0].programInput === parseInt(channel.input);
    }

    isPreviewChannel(channel) {
        return this.state.video.ME[0].previewInput === parseInt(channel.input);
    }

    changeProgramInput(input) {
        this.sendMessage({ method: 'changeProgramInput', params: { device: this.state.device, input } })
    }

    changePreviewInput(input) {
        this.sendMessage({ method: 'changePreviewInput', params: { device: this.state.device, input } })
    }

    changeProgram(channel) {
        return this.changeProgramInput(this.state.device, channel.input);
    }

    changePreview(channel) {
        return this.changePreviewInput(channel.input);
    };

    autoTransition() {
        this.sendMessage({ method: 'autoTransition', params: { device: this.state.device } });
    }

    cutTransition() {
        this.sendMessage({ method: 'cutTransition', params: { device: this.state.device } });
    }

    changeTransitionPreview() {
        const status = !this.state.video.ME[0].transitionPreview;
        this.sendMessage({ method: 'changeTransitionPreview', params: { device: this.state.device, status } });
    }

    changeTransitionPosition(percent) {
        console.assert(percent);
        this.sendMessage({ method: 'changeTransitionPosition', params: { device: this.state.device, position: parseFloat(percent) * 10000 } });
    }

    changeTransitionType(type) {
        this.sendMessage({ method: 'changeTransitionType', params: { type } });
    }

    toggleUpstreamKeyNextBackground() {
        const status = !this.state.video.ME[0].upstreamKeyNextBackground;
        this.sendMessage({ method: 'changeUpstreamKeyNextBackground', params: { device: this.state.device, status } });
    };

    toggleUpstreamKeyNextState(number) {
        const status = !this.state.video.ME[0].upstreamKeyNextState[number];
        this.sendMessage({ method: 'changeUpstreamKeyNextBackground', params: { device: this.state.device, number, status } });
    };

    toggleUpstreamKeyState(number) {
        const state = !this.state.video.ME[0].upstreamKeyState[number];
        this.sendMessage({ method: 'changeUpstreamKeyState', params: { device: this.state.device, number, state } });
    };

    toggleDownstreamKeyTie(number) {
        const state = !this.state.video.downstreamKeyTie[number];
        this.sendMessage({ method: 'changeDownstreamKeyTie', params: { device: this.state.device, number, state } });
    };

    toggleDownstreamKeyOn(number) {
        const state = !this.state.video.downstreamKeyOn[number];
        this.sendMessage({ method: 'changeDownstreamKeyOn', params: { device: this.state.device, number, state } });
    };

    autoDownstreamKey(number) {
        this.sendMessage({ method: 'autoDownstreamKey', params: { device: this.state.device, number } });
    }
    fadeToBlack() {
        this.sendMessage({ method: 'fadeToBlack', params: { device: this.state.device } });
    }

    uploadMediaFile(file, number) {
        let img, reader;
        let atem = this;
        if (file.type.match(/image.*/)) {
          img = document.querySelectorAll('.media-thumb img')[number];
          reader = new FileReader();
          reader.onload = function(e) {
            img.onload = function() {
                let canvas, ctx;
                canvas = document.createElement("canvas");
                canvas.width = 1280
                canvas.height = 720
                ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, 1280, 720);
                // upload to server
                atem.sendMessage({
                    method: "uploadMedia",
                    params: {
                        device: atem.state.device,
                        number: number || 0,
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

module.exports = { ATEM };
