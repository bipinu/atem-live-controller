<script>
import { onMount } from 'svelte';

let switchers = [
    {
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
          "name": "Titles",
          "label": "TIT",
          "id": "1",
          "device": 0,
          "input": "1"
        },
        "2": {
          "name": "Video PC",
          "label": "VID",
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
          "name": "Media 1 Logo",
          "label": "LOGO",
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
            "transitionStyle": 2,
            "upstreamKeyNextBackground": true,
            "transitionPreview": false,
            "transitionPosition": 0,
            "transitionFrameCount": 25,
            "fadeToBlack": false
          }
        ],
        "downstreamKeyOn": [false, false],
        "downstreamKeyTie": [false, false],
        "auxs": {}
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
      "model": 1,
      "visibleChannels": [
        {
          "name": "Titulky",
          "label": "TIT",
          "id": "1",
          "device": 0,
          "input": "1"
        },
        {
          "name": "Video PC",
          "label": "VID",
          "id": "2",
          "device": 0,
          "input": "2"
        },
        {
          "name": "Cam 3",
          "label": "CAM3",
          "id": "3",
          "device": 0,
          "input": "3"
        },
        {
          "name": "Cam 4",
          "label": "CAM4",
          "id": "4",
          "device": 0,
          "input": "4"
        },
        {
          "name": "Cam 5",
          "label": "CAM5",
          "id": "5",
          "device": 0,
          "input": "5"
        },
        {
          "name": "Cam 6",
          "label": "CAM6",
          "id": "6",
          "device": 0,
          "input": "6"
        },
        {
          "name": "Black",
          "label": "Blk",
          "id": "0",
          "device": 0,
          "input": "0"
        },
        {
          "name": "Color 1",
          "label": "Col1",
          "id": "2001",
          "device": 0,
          "input": "2001"
        },
        {
          "name": "Color 2",
          "label": "Col2",
          "id": "2002",
          "device": 0,
          "input": "2002"
        },
        {
          "name": "Color Bars",
          "label": "Bars",
          "id": "1000",
          "device": 0,
          "input": "1000"
        },
        {
          "name": "Media 1 Logo",
          "label": "LOGO",
          "id": "3010",
          "device": 0,
          "input": "3010"
        },
        {
          "name": "Media Player 2",
          "label": "MP2",
          "id": "3020",
          "device": 0,
          "input": "3020"
        }
      ]
    }
  ];

let channels = [
    { "device": 0, "input": 1 },
    { "device": 0, "input": 2 },
    { "device": 0, "input": 3 },
    { "device": 0, "input": 4 },
    { "device": 0, "input": 5 },
    { "device": 0, "input": 6 },
    { "device": 0, "input": 7 },
    { "device": 0, "input": 8 },
    { "device": 0, "input": 9 },
    { "device": 0, "input": 10 },
    { "device": 0, "input": 3010 },
    { "device": 0, "input": 3020 }
  ];

let ws;
let intervalID = 0;
let socketIsOpen = false;

function doConnect() {
	ws = new WebSocket("ws://localhost:8080/ws");
	ws.addEventListener('open', function(event) {
		console.log('websocket opened');
		socketIsOpen = true;
		clearInterval(intervalID);
		intervalID = 0;
	});
	ws.addEventListener('message', function(event) {
		let data = JSON.parse(event.data);
		console.log(data);
		if (data.switchers) {
			for (var atem of data.switchers) {
				updateVisibleChannels(atem);
			}
			switchers = data.switchers;
		}
		if (data.channels) {
			channels = data.channels;
		}
		return data;
	});
	ws.addEventListener('error', function(evt) {
		socketIsOpen = false;
		if (!intervalID) {
			intervalID = setTimeout(doConnect, 5000);
		}
	});
	ws.addEventListener('close', function(event) {
		console.log('websocket closed');
		socketIsOpen = false;
		if (!intervalID) {
			intervalID = setTimeout(doConnect, 5000);
		}
	});
}

function onKeyUp(event) {
	var key = event.key || event.keyCode;
	if (key === ' ' || key === 32) {
        cutTransition();
    } else if (key === 'Enter' || key === 13) {
		autoTransition();
	} else if (key >= '0' && key <= '9') {
		if (event.getModifierState('Control')) {
			changeProgramInput(0, key);
		} else {
			changePreviewInput(0, key);
		}
}

onMount(() => {
	doConnect();
	document.addEventListener('keyup', onKeyUp);
});

function sendMessage(data) {
	if (socketIsOpen) {
		ws.send(JSON.stringify(data));
	} else {
		console.log('sendMessage failed: Websocket not connected');
	}
}

function updateVisibleChannels(atem) {
	atem.visibleChannels = [];
	for (var id in atem.channels) {
		const channel = atem.channels[id];
		channel.id = id;
		channel.device = atem.device;
		channel.input = id;
	}
	// standard inputs
	for (var id=1; id<10; id++) {
		if (atem.channels[id]) {
			atem.visibleChannels.push(atem.channels[id]);
		} else {
			break;
		}
	}
	// Black
	if (atem.channels[0]) {
		atem.visibleChannels.push(atem.channels[0]);
	}
	// Colors
	for (var id=2001; id<3000; id++) {
		if (atem.channels[id]) {
			atem.visibleChannels.push(atem.channels[id]);
		} else {
			break;
		}
	}
	// Color Bars
	if (atem.channels[1000]) {
		atem.visibleChannels.push(atem.channels[1000]);
	}
	// Media Players
	for (var id=3010; id<4000; id+=10) {
		if (atem.channels[id]) {
			atem.visibleChannels.push(atem.channels[id]);
		} else {
			break;
		}
	}
}

function findChannel(device, input) {
	return switchers[device].channels[input];
}

function findChainChannel(device, targetDevice) {
	for (let channel of channels) {
		if ((channel.device === device) && (channel.chainDevice === targetDevice)) { return channel; }
	}
}

function getParentProgramChannel() {
	return findChannel(0, switchers[0].video.ME[0].programInput);
}

function getVirtualProgramChannel() {
	const parentProgramChannel = findChannel(0, switchers[0].video.ME[0].programInput);
	if (parentProgramChannel.chainDevice != null) {
		return findChannel(parentProgramChannel.chainDevice, switchers[parentProgramChannel.chainDevice].video.ME[0].programInput);
	} else {
		return findChannel(0, switchers[0].video.ME[0].programInput);
	}
};

function getVirtualPreviewChannel() {
	const parentProgramChannel = findChannel(0, switchers[0].video.ME[0].programInput);
	const parentPreviewChannel = findChannel(0, switchers[0].video.ME[0].previewInput);
	if ((parentPreviewChannel.chainDevice != null) && (parentProgramChannel.chainDevice === parentPreviewChannel.chainDevice)) {
		return findChannel(parentPreviewChannel.chainDevice, switchers[parentPreviewChannel.chainDevice].video.ME[0].previewInput);
	} else if (parentPreviewChannel.chainDevice != null) {
		return findChannel(parentPreviewChannel.chainDevice, switchers[parentPreviewChannel.chainDevice].video.ME[0].programInput);
	} else {
		return findChannel(0, switchers[0].video.ME[0].previewInput);
	}
};

function getTransitionDevice() {
	const parentProgramChannel = findChannel(0, switchers[0].video.ME[0].programInput);
	const parentPreviewChannel = findChannel(0, switchers[0].video.ME[0].previewInput);
	console.log(parentProgramChannel, parentPreviewChannel);
	if ((parentPreviewChannel.chainDevice != null) && (parentProgramChannel.chainDevice === parentPreviewChannel.chainDevice)) {
		return parentPreviewChannel.chainDevice;
	} else {
		return 0;
	}
};

function isProgramChannel(channel) {
	const programChannel = getVirtualProgramChannel();
	return (programChannel.device === channel.device) && (programChannel.input === channel.input);
};

function isPreviewChannel(channel) {
	const previewChannel = getVirtualPreviewChannel();
	return (previewChannel.device === channel.device) && (previewChannel.input === channel.input);
};

function getChannelInput(channel) {
	return switchers[channel.device].channels[channel.input];
}

function changeProgramInput(device, input) {
	sendMessage({changeProgramInput: {device, input}})
}

function changePreviewInput(device, input) {
	sendMessage({changePreviewInput: {device, input}})
}

function changeProgram(channel) {
	changeProgramInput(channel.device, channel.input);
}

function changePreview(channel) {
	const isParentDevice = channel.device === 0;
	if (isParentDevice) {
		return changePreviewInput(0, channel.input);
	} else {
		const chainChannel = findChainChannel(0, channel.device);
		changePreviewInput(chainChannel.device, chainChannel.input);
		if (getParentProgramChannel().chainDevice === channel.device) {
			return changePreviewInput(channel.device, channel.input);
		} else {
			return changeProgramInput(channel.device, channel.input);
		}
	}
};

function autoTransition(device) {
	sendMessage({autoTransition: {device: 0}});
}

function cutTransition(device) {
	sendMessage({cutTransition: {device: 0}});
}

function changeTransitionPosition(percent, device = getTransitionDevice()) {
	sendMessage({changeTransitionPosition: {device, position: parseInt(percent*10000)}});
}

function changeTransitionType(type) {
	sendMessage({changeTransitionType: {type}});
}

function toggleUpstreamKeyNextBackground() {
	const status = !switchers[0].video.ME[0].upstreamKeyNextBackground;
	sendMessage({changeUpstreamKeyNextBackground: {device: 0, status}});
};

function toggleUpstreamKeyNextState(number) {
	const status = !switchers[0].video.ME[0].upstreamKeyNextState[number];
	sendMessage({changeUpstreamKeyNextBackground: {device: 0, number, status}});
};

function toggleUpstreamKeyState(number) {
	const status = !switchers[0].video.ME[0].upstreamKeyState[number];
	sendMessage({changeUpstreamKeyState: {device: 0, number, status}});
};

function toggleDownstreamKeyTie(number) {
	const status = !switchers[0].video.downstreamKeyTie[number];
	sendMessage({changeDownstreamKeyTie: {device: 0, number, status}});
};

function toggleDownstreamKeyOn(number) {
	const status = !switchers[0].video.downstreamKeyOn[number];
	sendMessage({changeDownstreamKeyOn: {device: 0, number, status}});
};

function autoDownstreamKey(number) {
	sendMessage({autoDownstreamKey: {device: 0, number}});
}
function fadeToBlack() {
	sendMessage({fadeToBlack: {device: 0}});
}
</script>

<section class="channels">
	<h2 class="section">Program</h2>
	<div class="well">
	{#each switchers[0].visibleChannels as channel}
		<div class="button" class:red={isProgramChannel(channel)} on:click={e=>changeProgram(channel)}>{channel.label}</div>
	{/each}
	</div>
</section>

<section class="channels">
	<h2 class="section">Preview</h2>
	<div class="well">
	{#each switchers[0].visibleChannels as channel}
		<div class="button" class:green={isPreviewChannel(channel)} on:click={e=>changePreview(channel)}>{channel.label}</div>
	{/each}
	</div>
</section>

<section class="next-transition">
	<h2 class="section">Next Transition</h2>
	<div class="well">
		<div class="button" class:red={switchers[0].video.ME[0].upstreamKeyState[0]} on:click={e=>toggleUpstreamKeyState(0)}>ON AIR</div>
		<div class="button" class:yellow={switchers[0].video.ME[0].upstreamKeyNextBackgroundState} on:click={e=>toggleUpstreamKeyNextBackground()}>BKGD</div>
		<div class="button" class:yellow={switchers[0].video.ME[0].upstreamKeyNextState[0]} on:click={e=>toggleUpstreamKeyNextState(0)}>Key 1</div>
	</div>
</section>

<section class="transition">
	<h2 class="section">Transition style</h2>
	<div class="well">
		<div class="button" class:yellow={switchers[0].video.ME[0].transitionStyle==0} on:click={e=>changeTransitionType(0)}>MIX</div>
		<div class="button" class:yellow={switchers[0].video.ME[0].transitionStyle==1} on:click={e=>changeTransitionType(1)}>DIP</div>
		<div class="button" class:yellow={switchers[0].video.ME[0].transitionStyle==2} on:click={e=>changeTransitionType(2)}>WIPE</div>
		<br>
		<div class="button" on:click={cutTransition}>CUT</div>
		<div class="button" class:red={switchers[0].video.ME[0].transitionPosition != 0} on:click={autoTransition}>AUTO</div>
	</div>
</section>

<section class="dsk">
	<h2 class="section">Downstream Key</h2>
	<div class="well">
		<div class="button" class:yellow={switchers[0].video.downstreamKeyTie[0]} on:click={e=>toggleDownstreamKeyTie(1)}>TIE</div>
		<div class="button" class:red={switchers[0].video.downstreamKeyOn[0]} on:click={e=>toggleDownstreamKeyOn(1)}>ON AIR</div>
		<div class="button" class:red={false} on:click={e=>autoDownstreamKey(1)}>AUTO</div>

		<div class="button" class:yellow={switchers[0].video.downstreamKeyTie[1]} on:click={e=>toggleDownstreamKeyTie(2)}>TIE</div>
		<div class="button" class:red={switchers[0].video.downstreamKeyOn[1]} on:click={e=>toggleDownstreamKeyOn(2)}>ON AIR</div>
		<div class="button" class:red={false} on:click={e=>autoDownstreamKey(2)}>AUTO</div>
	</div>
</section>

<section class="ftb">
	<h2 class="section">Fade to Black</h2>
	<div class="well">
		<div class="button" class:red={switchers[0].video.ME[0].fadeToBlack} on:click={fadeToBlack}>FTB</div>
	</div>
</section>
