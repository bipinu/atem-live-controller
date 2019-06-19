<script>
import { onMount } from 'svelte';
import Button from './Button.svelte';

let state = [{
    topology: {
      numberOfMEs: null,
      numberOfSources: null,
      numberOfColorGenerators: null,
      numberOfAUXs: null,
      numberOfDownstreamKeys: null,
      numberOfStingers: null,
      numberOfDVEs: null,
      numberOfSuperSources: null
    },
    tallys: [],
    channels: {
		1: {
			name: 'Kamera 1',
			label: 'Cam1',
		},
		2: {
			name: 'meno 2',
			label: 'Cam2',
		},
		3: {
			name: 'meno 4',
			label: 'Cam3',
		},
		4: {
			name: 'meno 4',
			label: 'Cam4',
		},
		5: {
			name: 'meno 5',
			label: 'Cam5',
		},
		6: {
			name: 'meno 6',
			label: 'Cam6',
		},
	},
    channelsArray: [],
    video: {
      ME: [{
		  programInput: 1,
		  previewInput: 2,
	  }],
      downstreamKeyOn: [],
      downstreamKeyTie: [],
      auxs: {}
    },
    audio: {
      hasMonitor: null,
      numberOfChannels: null,
      channels: {}
    }
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

$: 	updateChannelsArray();

function updateChannelsArray() {
	state[0].channelsArray = [];
	for (var id in state[0].channels) {
		const channel = state[0].channels[id];
		channel.id = id;
		state[0].channelsArray.push(channel);
	}
}

let ws;

onMount(() => {
	ws = new WebSocket("ws://localhost:8080/ws");
	ws.addEventListener('open', function(event) {
		console.log('websocket opened');
	})
	ws.addEventListener('message', function(message) {
		console.log(message.data);
		let data = JSON.parse(message.data);
		if (data.state) {
			state = data.state;
		}
		if (data.channels) {
			channels = data.channels;
		}
	})
	ws.addEventListener('error', function(err) {
		console.log('error:', err);
	})
});

function sendMessage(data) {
	ws.send(JSON.stringify(data));
}

function findChannel(device, input) {
	for (let channel of channels) {
		if ((channel.device === device) && (channel.input === input)) {
			return channel;
		}
	}
}

function findChainChannel(device, targetDevice) {
	for (let channel of channels) {
		if ((channel.device === device) && (channel.chainDevice === targetDevice)) { return channel; }
	}
}

function getParentProgramChannel() {
	return findChannel(0, state[0].video.ME[0].programInput);
}

function getVirtualProgramChannel() {
	const parentProgramChannel = findChannel(0, state[0].video.ME[0].programInput);
	if (parentProgramChannel.chainDevice != null) {
		return findChannel(parentProgramChannel.chainDevice, state[parentProgramChannel.chainDevice].video.ME[0].programInput);
	} else {
		return findChannel(0, state[0].video.ME[0].programInput);
	}
};

function getVirtualPreviewChannel() {
	const parentProgramChannel = findChannel(0, state[0].video.ME[0].programInput);
	const parentPreviewChannel = findChannel(0, state[0].video.ME[0].previewInput);
	if ((parentPreviewChannel.chainDevice != null) && (parentProgramChannel.chainDevice === parentPreviewChannel.chainDevice)) {
		return findChannel(parentPreviewChannel.chainDevice, state[parentPreviewChannel.chainDevice].video.ME[0].previewInput);
	} else if (parentPreviewChannel.chainDevice != null) {
		return findChannel(parentPreviewChannel.chainDevice, state[parentPreviewChannel.chainDevice].video.ME[0].programInput);
	} else {
		return findChannel(0, state[0].video.ME[0].previewInput);
	}
};

function getTransitionDevice() {
	const parentProgramChannel = findChannel(0, state[0].video.ME[0].programInput);
	const parentPreviewChannel = findChannel(0, state[0].video.ME[0].previewInput);
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
	return state[channel.device].channels[channel.input];
}

function changePreviewInput(device, input) {
	sendMessage({changePreivewInput: {device, input}})
}

function changeProgramInput(device, input) {
	sendMessage({changeProgramInput: {device, input}})
}

function changeProgram(channel) {
	changePreview(channel);
	cutTransition();
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

function autoTransition(device = getTransitionDevice()) {
	sendMessage({autoTransition: {device}});
}

function cutTransition(device = getTransitionDevice()) {
	sendMessage({cutTransition: {device}});
}

function changeTransitionPosition(percent, device = getTransitionDevice()) {
	sendMessage({changeTransitionPosition: {device, position: parseInt(percent*10000)}});
}

function changeTransitionType(type) {
	sendMessage({changeTransitionType: {type}});
}

function toggleUpstreamKeyNextBackground() {
	const state = !state[0].video.ME[0].upstreamKeyNextBackground;
	sendMessage({changeUpstreamKeyNextBackground: {device: 0, state}});
};

function toggleUpstreamKeyNextState(number) {
	const state = !state[0].video.ME[0].upstreamKeyNextState[number];
	sendMessage({changeUpstreamKeyNextBackground: {device: 0, number, state}});
};

function toggleUpstreamKeyState(number) {
	const state = !state[0].video.ME[0].upstreamKeyState[number];
	sendMessage({changeUpstreamKeyState: {device: 0, number, state}});
};

function toggleDownstreamKeyTie(number) {
	const state = !state[0].video.downstreamKeyTie[number];
	sendMessage({changeDownstreamKeyTie: {device: 0, number, state}});
};

function toggleDownstreamKeyOn(number) {
	const state = !state[0].video.downstreamKeyOn[number];
	sendMessage({changeDownstreamKeyOn: {device: 0, number, state}});
};

function autoDownstreamKey(number) {
	sendMessage({autoDownstreamKey: {device: 0, number, state}});
}
function fadeToBlack() {
	sendMessage({fadeToBlack: {device: 0}});
}
</script>

<section class="channels">
	<h2 class="section">Program</h2>
	{#each state[0].channelsArray as channel}
	<div class="button" class:red={isProgramChannel(channel.id)} on:click={e=>changeProgram(channel.id)}>{channel.label}</div>
	{/each}
</section>

<section class="channels">
	<h2 class="section">Preview</h2>
	{#each state[0].channelsArray as channel}
	<div class="button" class:green={isPreviewChannel(channel.id)} on:click={e=>changePreview(channel.id)}>{channel.label}</div>
	{/each}
</section>

<section class="next-transition">
	<h2 class="section">Next Transition</h2>
	<Button color="red" glow={true} on:click={e=>toggleUpstreamKeyState(0)}>ON AIR</Button>
	<Button color="yellow" glow={true} on:click={toggleUpstreamKeyNextBackground}>BKGD</Button>
	<Button color="yellow" glow={true} on:click={e=>toggleUpstreamKeyNextState(0)}>Key 1</Button>
</section>

<section class="transition">
	<h2 class="section">Transition style</h2>
	<Button color="red" glow={false} on:click={e=>changeTransitionType(0)}>MIX</Button>
	<Button color="red" glow={false} on:click={e=>changeTransitionType(1)}>DIP</Button>
	<Button color="red" glow={false} on:click={e=>changeTransitionType(2)}>WIPE</Button>
	<!-- <Button color="red" glow={false} on:click={e=>changeTransitionType(3)}>STING</Button> -->
	<!-- <Button color="red" glow={false} on:click={e=>changeTransitionType(4)}>DVE</Button> -->
	<!-- <Button color="red" glow={false} on:click={changeTransitionPreview}>PREV</Button> -->
	<br>
	<Button color="red" glow={false} on:click={cutTransition}>CUT</Button>
	<Button color="red" glow={true} on:click={autoTransition}>AUTO</Button>
</section>

<section class="dsk">
	<h2 class="section">Downstream Key</h2>

	<Button color="yellow" glow={true} on:click={e=>toggleDownstreamKeyTie(1)}>TIE</Button>
	<Button color="red" glow={true} on:click={e=>toggleDownstreamKeyOn(1)}>ON AIR</Button>
	<Button color="red" glow={false} on:click={e=>autoDownstreamKey(1)}>AUTO</Button>

	<Button color="yellow" glow={false} on:click={e=>toggleDownstreamKeyTie(2)}>TIE</Button>
	<Button color="red" glow={false} on:click={e=>toggleDownstreamKeyOn(2)}>ON AIR</Button>
	<Button color="red" glow={false} on:click={e=>autoDownstreamKey(2)}>AUTO</Button>
</section>

<section class="ftb">
	<h2 class="section">Fade to Black</h2>
	<Button color="red" glow={false} on:click={fadeToBlack}>FTB</Button>
</section>
