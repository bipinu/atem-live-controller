const express    = require('express');
const bodyParser = require('body-parser');
const ATEM       = require('applest-atem');
const config     = require('../config.json');

const app = express();
var expressWs = require('express-ws')(app);

let atem;
const switchers = [];

let STATE = {
  channels: config.channels,
  devices: switchers,
}

let CLIENTS = [];

for (var switcher of config.switchers) {
  atem = new ATEM;
  atem.event.setMaxListeners(5);
  atem.connect(switcher.addr, switcher.port);
  switchers.push(atem);

  atem.on('stateChanged', (err, state) => {
    for (client of CLIENTS) {
      client.send(JSON.stringify({state}));
    }
  })
}

// app.use(bodyParser.json());
app.use('/', express.static(__dirname + '/../public'));

app.ws('/ws', function(ws, req) {
  const ip = req.connection.remoteAddress;
  console.log(ip, 'connected');
  // CLIENTS = ws.getWss().clients;
  ws.send(JSON.stringify({channels: config.channels}));

  ws.on('message', function incoming(message) {
    console.log(message);
    let data = JSON.parse(message);
    if (data.changePreviewInput) {
      const { device, input } = data.changePreviewInput;
      switchers[device].changePreviewInput(input);
    }
    if (data.changeProgramInput) {
      const { device, input } = data.changeProgramInput;
      switchers[device].changeProgramInput(input);
    }
    if (data.autoTransition) {
      const { device } = data.autoTransition;
      switchers[device].autoTransition();
    }
    if (data.cutTransition) {
      const { device } = data.cutTransition;
      switchers[device].cutTransition();
    }
    if (data.changeTransitionPosition) {
      const { device, position }   = data.changeTransitionPosition;
      switchers[device].changeTransitionPosition(position);
    }
    if (data.changeTransitionType) {
      const { type } = data.changeTransitionType;
      for (switcher of switchers) {
        switcher.changeTransitionType(type);
      }
    }
    if (data.changeUpstreamKeyState) {
      const { device, number, state } = data.changeUpstreamKeyState;
      switchers[device].changeUpstreamKeyState(number, state);
    }
    if (data.changeUpstreamKeyNextBackground) {
      const { device, state } = data.changeUpstreamKeyNextBackground;
      switchers[device].changeUpstreamKeyNextBackground(state);
    }
    if (data.changeUpstreamKeyNextState) {
      const { device, number, state } = data.changeUpstreamKeyNextState;
      switchers[device].changeUpstreamKeyNextState(number, state);
    }
    if (data.changeDownstreamKeyOn) {
      const { device, number, state } = data.changeDownstreamKeyOn;
      switchers[device].changeDownstreamKeyOn(number, state);
    }
    if (data.changeDownstreamKeyTie) {
      const { device, number, state } = data.changeDownstreamKeyTie;
      switchers[device].changeDownstreamKeyTie(number, state);
    }
    if (data.autoDownstreamKey) {
      const { device, number } = data.autoDownstreamKey;
      switchers[device].autoDownstreamKey(number);
    }
    if (data.fadeToBlack) {
      const { device } = data.fadeToBlack;
      switchers[device].fadeToBlack();
    }
  });
});

// TODO: periodicaly update clients
app.get('/api/switchersState', (req, res) => {
    const result = [];
    for (atem of switchers) {
        result.push(atem.state);
    }
    res.send(JSON.stringify(result));
  }
);

app.listen(8080);
