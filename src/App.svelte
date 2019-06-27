<script>
  import { onMount } from "svelte";
  import { ATEM } from "./atem.js";
  import Feather from "./Feather.svelte";

  let switchers = [];

  let ws;
  let intervalID = 0;
  let socketIsOpen = false;

  function doConnect() {
    ws = new WebSocket("ws://localhost:8080/ws");
    ws.addEventListener("open", function(event) {
      console.log("websocket opened");
      socketIsOpen = true;
      clearInterval(intervalID);
      intervalID = 0;
      switchers[0] = new ATEM();
      for (let atem of switchers) {
        atem.websocket = ws;
      }
    });
    ws.addEventListener("message", function(event) {
      let data = JSON.parse(event.data);
      console.log(data);
      const atem = switchers[data.device || 0];
      atem.state = data;
      return data;
    });
    ws.addEventListener("error", function(evt) {
      socketIsOpen = false;
      if (!intervalID) {
        intervalID = setTimeout(doConnect, 5000);
      }
    });
    ws.addEventListener("close", function(event) {
      console.log("websocket closed");
      socketIsOpen = false;
      if (!intervalID) {
        intervalID = setTimeout(doConnect, 5000);
      }
    });
  }

  function onKeyUp(event) {
    var key = event.key || event.keyCode;
    if (key === " " || key === 32) {
      event.preventDefault();
      switchers[0].cutTransition();
    } else if (key === "Enter" || key === 13) {
      switchers[0].autoTransition();
    } else if (key >= "0" && key <= "9") {
      if (event.getModifierState("Control")) {
        switchers[0].changeProgramInput(key);
      } else {
        switchers[0].changePreviewInput(key);
      }
    }
  }

  onMount(() => {
    doConnect();
    document.addEventListener("keyup", onKeyUp);
  });

  function sendMessage(data) {
    if (socketIsOpen) {
      ws.send(JSON.stringify(data));
    } else {
      console.log("sendMessage failed: Websocket not connected");
    }
  }

  function uploadMediaFile(file, number) {
    let img, reader;
    if (file.type.match(/image.*/)) {
      img = document.querySelectorAll('.media-thumb img')[number-1];
      reader = new FileReader();
      reader.onload = function(e) {
        img.onload = function() {
          let canvas, ctx;
          canvas = document.createElement("canvas");
          canvas.width = 1280
          canvas.height = 720
          ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, 1280, 720);
          // upload canvas.toDataURL("image/png")
        }
        img.src = e.target.result;
      }
      reader.readAsDataURL(file);
    } else {
      alert('This file is note an image.');
    }
  }
</script>

{#each switchers as atem}
<header>
  <h1>{atem.state._pin}</h1>
  <a href="#switcher" class="tab"><Feather icon="grid"/>Switcher</a>
  <a href="#media" class="tab"><Feather icon="film"/>Media</a>
  <a href="#audio" class="tab"><Feather icon="sliders"/>Audio</a>
  <a href="#camera" class="tab"><Feather icon="video"/>Camera</a>
  <a href="#settings" class="tab"><Feather icon="settings"/>Settings</a>
</header>
<div id="switcher" class="screen">

  <section class="channels">
    <h2 class="section">Program & Preview</h2>
    <div class="well">
      {#each atem.state.visibleChannels as channel}
        <div
          class="button"
          class:red={atem.isProgramChannel(channel)}
          class:green={atem.isPreviewChannel(channel)}
          on:click={e => atem.changePreview(channel)}>
          <p>{channel.label}</p>
        </div>
      {/each}
    </div>
  </section>

  <section class="transition">
    <h2 class="section">Transition</h2>
    <div class="well">
      <div class="button" on:click={atem.cutTransition}>
        <p>CUT</p>
      </div>
      <div
        class="button"
        class:red={atem.state.video.ME[0].transitionPosition != 0}
        on:click={atem.autoTransition}>
        <p>AUTO</p>
      </div>
      <input
        class="slider"
        type="range"
        min="0"
        max="100"
        bind:value={atem.state.video.ME[0].transitionPosition}
        on:input={e => atem.changeTransitionPosition(this.value)} />
    </div>
  </section>

  <section class="next-transition">
    <h2 class="section">Next Transition</h2>
    <div class="well">
      <div
        class="button"
        class:yellow={atem.state.video.ME[0].upstreamKeyNextBackgroundState}
        on:click={e => atem.toggleUpstreamKeyNextBackground()}>
        <p>BKGD</p>
      </div>
      <div
        class="button"
        class:red={atem.state.video.ME[0].upstreamKeyState[0]}
        on:click={e => atem.toggleUpstreamKeyState(0)}>
        <p>ON<br />AIR</p>
      </div>
      <div
        class="button"
        class:yellow={atem.state.video.ME[0].upstreamKeyNextState[0]}
        on:click={e => atem.toggleUpstreamKeyNextState(0)}>
        <p>Key 1</p>
      </div>
    </div>
  </section>

  <section class="transition-style">
    <h2 class="section">Transition style</h2>
    <div class="well">
      <div
        class="button"
        class:yellow={atem.state.video.ME[0].transitionStyle == 0}
        on:click={e => atem.changeTransitionType(0)}>
        <p>MIX</p>
      </div>
      <div
        class="button"
        class:yellow={atem.state.video.ME[0].transitionStyle == 1}
        on:click={e => atem.changeTransitionType(1)}>
        <p>DIP</p>
      </div>
      <div
        class="button"
        class:yellow={atem.state.video.ME[0].transitionStyle == 2}
        on:click={e => atem.changeTransitionType(2)}>
        <p>WIPE</p>
      </div>
      {#if atem.state.topology.numberOfStingers > 0}
        <div
          class="button"
          class:yellow={atem.state.video.ME[0].transitionStyle == 3}
          on:click={e => atem.changeTransitionType(3)}>
          <p>STING</p>
        </div>
      {/if}
      {#if atem.state.topology.numberOfDVEs > 0}
        <div
          class="button"
          class:yellow={atem.state.video.ME[0].transitionStyle == 4}
          on:click={e => atem.changeTransitionType(4)}>
          <p>DVE</p>
        </div>
      {/if}
      <div class="button" on:click={atem.changeTransitionPreview}>
        <p>PREV<br />TRAN</p>
      </div>
    </div>
  </section>

  <section class="downstream-key">
    <h2 class="section">Downstream Key 1</h2>
    <div class="well">
      <div
        class="button"
        class:yellow={atem.state.video.downstreamKeyTie[0]}
        on:click={e => atem.toggleDownstreamKeyTie(1)}>
        <p>TIE</p>
      </div>
      <div
        class="button"
        class:red={atem.state.video.downstreamKeyOn[0]}
        on:click={e => atem.toggleDownstreamKeyOn(1)}>
        <p>ON<br />AIR</p>
      </div>
      <div
        class="button"
        class:red={false}
        on:click={e => atem.autoDownstreamKey(1)}>
        <p>AUTO</p>
      </div>
    </div>
  </section>
  <section class="downstream-key">
    <h2 class="section">Downstream Key 2</h2>
    <div class="well">
      <div
        class="button"
        class:yellow={atem.state.video.downstreamKeyTie[1]}
        on:click={e => atem.toggleDownstreamKeyTie(2)}>
        <p>TIE</p>
      </div>
      <div
        class="button"
        class:red={atem.state.video.downstreamKeyOn[1]}
        on:click={e => atem.toggleDownstreamKeyOn(2)}>
        <p>ON<br />AIR</p>
      </div>
      <div
        class="button"
        class:red={false}
        on:click={e => atem.autoDownstreamKey(2)}>
        <p>AUTO</p>
      </div>
    </div>
  </section>

  <section class="fade-to-black">
    <h2 class="section">Fade to Black</h2>
    <div class="well">
      <div
        class="button"
        class:red={atem.state.video.ME[0].fadeToBlack}
        on:click={atem.fadeToBlack}>
        <p>FTB</p>
      </div>
    </div>
  </section>
</div><!-- screen switcher-->

<div id="media" class="screen">
  <div class="media-thumb"
       on:drop={e=>uploadMediaFile(e.dataTransfer.files[0], 1)}
       on:click={e=>this.querySelector('input').click()}>
    <img alt="Media 2" />
    <input type="file" name="media" on:change={e=>uploadMediaFile(this.files[0], 1)}/>
  </div>
  <div class="media-thumb"
       on:drop={e=>uploadMediaFile(e.dataTransfer.files[0], 2)}
       on:click={e=>this.querySelector('input').click()}>
    <img alt="Media 2" />
    <input type="file" name="media" on:change={e=>uploadMediaFile(this.files[0], 2)}/>
  </div>
</div><!-- screen media-->
{/each}
