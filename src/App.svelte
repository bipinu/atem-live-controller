<script>
  import { onMount } from "svelte";
  import { AtemClient } from "./atem.js";
  import Feather from "./Feather.svelte";

  let ws;
  let atems = [];
  let intervalID = 0;
  let currentME = 0;


  function deepSet(obj, path, value){
      for (var i=0, path=path.split('.'), len=path.length-1; i<len; i++){
        if (Array.isArray(obj)) {
          obj = obj[+path[i]];
        } else {
          obj = obj[path[i]];
        }
      };
      return obj[path[i]] = value;
  };

  function doConnect() {
    console.debug("Opening websocket...");
    let url  = window.location + "";
    url = url.slice(0, url.lastIndexOf("/"));
    url = url.replace("http", "ws");
    if (ws) ws.close();
    atems[0] = new AtemClient();
    ws = new WebSocket(url + "/ws");
    ws.addEventListener("open", function(event) {
      console.log("Websocket opened");
      intervalID = clearTimeout(intervalID);
      atems[0].setWebsocket(ws);
      // update svelte
      ws = ws;
    });
    ws.addEventListener("message", function(event) {
      let data = JSON.parse(event.data);
      switch (data.event) {
        case 'connected':
          console.log(data);
          atems[0].connected = true;
        break;
        case 'disconnected':
          console.log(data);
          atems[0].connected = false;
        break;
        case 'changed':
          if (data.path === 'state') {
            console.log(data);
          }
          atems[0].connected = true;
          deepSet(atems[0], data.path, data.state)
          console.log('atem', atems[0])
          if (data.path === 'state' || data.path === 'state.inputs') {
            atems[0].visibleInputs = atems[0].getVisibleInputs();
          }
      }
      return data;
    });
    ws.addEventListener("error", function() {
      console.log("Websocket error");
      intervalID = setTimeout(doConnect, 1000);
    });
    ws.addEventListener("close", function() {
      console.log("Websocket closed");
      intervalID = setTimeout(doConnect, 1000);
    });
  }

  function onKeyUp(event) {
    var key = event.key || event.keyCode;
    if (key === " " || key === 32) {
      event.preventDefault();
      atems[0].cutTransition(currentME);
    } else if (key === "Enter" || key === 13) {
      atems[0].cutTransition(currentME);
      atems[0].autoTransition(currentME);
    } else if (key >= "0" && key <= "9") {
      if (event.getModifierState("Control")) {
        atems[0].changeProgramInput(+key, currentME);
      } else {
        atems[0].changePreviewInput(+key, currentME);
      }
    }
  }

  onMount(() => {
    doConnect();
    document.addEventListener("keyup", onKeyUp);
  });
</script>

{#each atems as atem}
<header>
  <h1>{atem.state.info.productIdentifier}</h1>
  <a href="#switcher" class="tab"><Feather icon="grid"/>Switcher</a>
  <a href="#media" class="tab"><Feather icon="film"/>Media</a>
  <a href="#macros" class="tab"><Feather icon="box"/>Macros</a>
  <span class="tab connection-status" class:connected={ws.readyState === 1}
        title="Connection status: green=connected, red=disconnected">
    {#if ws.readyState === 1}<Feather icon="zap"/>{:else}<Feather icon="alert-triangle"/>{/if}
    Server
  </span>
  <span class="tab connection-status" class:connected={atem.connected}
        title="Connection status: green=connected, red=disconnected">
    {#if atem.connected}<Feather icon="zap"/>{:else}<Feather icon="alert-triangle"/>{/if}
    ATEM
  </span>
</header>

<div id="atem" class="screen">
  {#if atem.state.info.capabilities.MEs > 1}
  <div class="button-group horizontal mix-effect-buttons" role="group" aria-label="Mix Effects">
  {#each Object.values(atem.state.video.ME) as ME}
    <button type="button" class="gray-button"
      class:active={currentME == ME.index}
      on:click={e => {currentME = ME.index}}>
    Mix Effects {ME.index+1}</button>
  {/each}
  </div>
  {/if}
  {#each [atem.state.video.ME[currentME]] as ME}
  <section class="channels">
    <h3>Mix Effects {ME.index+1} Program & Preview</h3>
    <div class="well">
    {#each atem.visibleInputs[ME.index] as input}
      <div class="button"
        class:red={ME.programInput === input}
        class:green={ME.previewInput === input}
        on:click={e => atem.changePreviewInput(input, ME.index)}
        title={atem.state.inputs[input].longName}>
        <p>{atem.state.inputs[input].shortName}</p>
      </div>
    {/each}
    </div>
  </section>

  <section class="transition">
    <h3>Transition</h3>
    <div class="well">
      <div class="button" on:click={e=>atem.cutTransition(ME.index)}>
        <p>CUT</p>
      </div>
      <div class="button"
        class:red={ME.transitionPosition > 0}
        on:click={e=>atem.autoTransition(ME.index)}>
        <p>AUTO</p>
      </div>
      <input class="slider" type="range"
        min="0" max="10000" step="100"
        bind:value={ME.transitionPosition}
        on:input={e => atem.setTransitionPosition(ME.transitionPosition, ME.index)}
        />
    </div>
  </section>

  <section class="next-transition">
    <h3>Next Transition</h3>
    <div class="well">
      <div class="button"
        class:yellow={ME.upstreamKeyers[0].fillSource}
        on:click={e => atem.toggleUpstreamKeyNextBackground(ME.index)}>
        <p>BKGD</p>
      </div>
      {#each ME.upstreamKeyers as keyer}
        <div class="button"
          class:red={keyer.onAir}
          on:click={e => atem.setkeyerOnAir(!keyer.onAir, ME, keyer.upstreamKeyerId)}>
          <p>ON<br />AIR</p>
        </div>
        <div class="button"
          class:yellow={keyer.flyEnabled}
          on:click={e => atem.setUpstreamKeyerFly(!keyer.flyEnabled, ME, keyer.upstreamKeyerId)}>
          <p>Key {keyer.upstreamKeyerId+1}</p>
        </div>
      {/each}
    </div>
  </section>

  <section class="transition-style">
    <h3>Transition style</h3>
    <div class="well">
      <div class="button"
        class:yellow={ME.transitionProperties.style == 0}
        on:click={e => atem.setTransitionStyle(0, ME.index)}>
        <p>MIX</p>
      </div>
      <div class="button"
        class:yellow={ME.transitionProperties.style == 1}
        on:click={e => atem.setTransitionStyle(1, ME.index)}>
        <p>DIP</p>
      </div>
      <div class="button"
        class:yellow={ME.transitionProperties.style == 2}
        on:click={e => atem.setTransitionStyle(2, ME.index)}>
        <p>WIPE</p>
      </div>
      {#if atem.state.info.capabilities.stingers > 0}
        <div class="button"
          class:yellow={ME.transitionProperties.style == 3}
          on:click={e => atem.setTransitionStyle(3, ME.index)}>
          <p>STING</p>
        </div>
      {/if}
      {#if atem.state.info.DVEs > 0}
        <div class="button"
          class:yellow={ME.transitionProperties.style == 4}
          on:click={e => atem.setTransitionStyle(4, ME.index)}>
          <p>DVE</p>
        </div>
      {/if}
      <div class="button"
        class:yellow={ME.transitionPreview}
        on:click={e=>atem.previewTransition(ME.index)}>
        <p>PREV<br />TRAN</p>
      </div>
    </div>
  </section>

  <section class="fade-to-black">
    <h3>Fade to Black</h3>
    <div class="well">
      <div class="button"
        class:red={ME.fadeToBlack.isFullyBlack}
        on:click={e=>atem.fadeToBlack(ME.index)}>
        <p>FTB</p>
      </div>
    </div>
  </section>
  {/each}

  <br/>
  {#each Object.keys(atem.state.video.downstreamKeyers) as key}
  <section class="downstream-key">
    <h3>Downstream Key {+key+1}</h3>
    <div class="well">
      <div class="button"
        class:yellow={atem.state.video.downstreamKeyers[key].properties.tie}
        on:click={e => atem.setDownstreamKeyTie(!atem.state.video.downstreamKeyers[key].properties.tie, +key)}>
        <p>TIE</p>
      </div>
      <div class="button"
        class:red={atem.state.video.downstreamKeyers[key].onAir}
        on:click={e => atem.setDownstreamKeyOnAir(!atem.state.video.downstreamKeyers[key].onAir, +key)}>
        <p>ON<br />AIR</p>
      </div>
      <div class="button"
        class:red={atem.state.video.downstreamKeyers[key].inTransition}
        on:click={e => atem.autoDownstreamKey(+key, !atem.state.video.downstreamKeyers[key].isTowardsOnAir)}>
        <p>AUTO</p>
      </div>
    </div>
  </section>
  {/each}

</div><!-- screen switcher-->

<div id="media" class="screen">
  <h2>Media</h2>
  {#each atem.state.media.players as player}
    <div class="media-thumb well"
        on:drop={e=>atem.uploadMediaFile(e.dataTransfer.files[0], player.stillIndex)}>
      <img alt={atem.state.media.stillPool[player.stillIndex].fileName || "Upload Media "+(player.stillIndex+1)}
      on:click={e=>e.target.parentNode.querySelector('input').click()}
      />
      <input type="file" name="media" on:change={e=>atem.uploadMediaFile(e.target.files[0], player.stillIndex)}/>
    </div>
  {/each}
</div><!-- screen media-->

<div id="macros" class="screen">
  <h2>Macros</h2>
  <div class="well">
    <div class="button"
      class:red={atem.state.macro.macroPlayer.isRunning}
      on:click={atem.macroStop}>
      <p>STOP</p>
    </div>
    <div class="button-group vertical">
    {#each atem.state.macro.macroProperties as macro}
      {#if macro.isUsed}
      <div class="gray-button"
        class:red={macro.macroIndex == atem.state.macro.macroPlayer.macroIndex}
        on:click={e=>atem.macroRun(macro.macroIndex)}
        title={macro.description}>
        <p>{macro.name}</p>
      </div>
      {/if}
    {/each}
    </div>
  </div>
</div> <!-- screen macros -->

{/each}