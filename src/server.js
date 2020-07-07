const express    = require('express');
const fileUpload = require('express-fileupload');
const { Atem, Commands, listVisibleInputs } = require('atem-connection')
const config     = require('../config.json');
const fs         = require('fs');
const { PassThrough } = require('stream');

const app = express();
var expressWs = require('express-ws')(app);

let atem;
const switchers = [];

let CLIENTS = expressWs.getWss().clients;

let device = 0;
for (var switcher of config.switchers) {
  console.log('Initializing switcher', switcher.addr, switcher.port)
  atem = new Atem({ externalLog: console.log })
  atem.connect(switcher.addr);
  atem.state.device = device;
  switchers.push(atem);

  atem.on('stateChanged', function (state, path) {
    if (path != 'info.lastTime') {
      // console.log('atem stateChanged', path)
      let paths = ['state']
      for (let a of path.split('.')) {
        const parent = state;
        if (Array.isArray(state)) {
          state = state[+a];
        } else {
          state = state[a];
        }
        if (typeof state === 'undefined') {
          if (a === 'transition') {
            // XXX - maybe it should be fixed in atem-connection lib
            a = 'transitionPosition'
            state = parent[a];
          } else {
            state = parent;
            break;
          }
        }
        paths.push(a);
      }
    
      // console.log('changed', paths.join('.'), state)
      broadcast(JSON.stringify({
        event: 'changed',
        device: atem.device,
        path: paths.join('.'),
        state: state
      }));
    }
  });
  atem.on('connected', () => {
    console.log('atem connected');
    broadcast(JSON.stringify({ event: 'connected', device: atem.device }));
  });
  atem.on('disconnected', (err) => {
    console.log('atem disconnected');
    broadcast(JSON.stringify({ event: 'disconnected', device: atem.device }));
  });
  atem.on('error', (err) => {
    console.log('atem error', err);
  });
  device += 1;
}

function broadcast(message) {
  for (var client of CLIENTS) {
    client.send(message);
  }
}

app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
}));

app.post('/uploadMedia', function (req, res) {
  console.log(req.files.media); // the uploaded file object
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.');
  }
  // let fileUploader = new ATEM.FileUploader(switchers[0]);
  // fileUploader.uploadFromPNGBuffer(req.files.media.data, req.params.bankIndex || 0);
  return res.status(200).send('Media was successfuly uploaded.');
});

app.use(express.static(__dirname + '/../public', {
  index: 'index.html',
}));

app.ws('/ws', function (ws, req) {
  const ip = req.connection.remoteAddress;
  console.log(ip, 'connected');
  // initialize client with all switchers
  for (const atem of switchers) {
    ws.send(JSON.stringify({ path: "", state: atem.state }));
    const visibleInputs = [];
    for (let me = 0; me < me.state.info.capabilities.MEs; me++) {
      visibleInputs.push(listVisibleInputs("program", atem.state, me));
      ws.send(JSON.stringify({path: "visibleInputs", state: visibleInputs}));
    }
  }

  ws.on('message', function incoming(message) {
    /* JSON-RPC v2 compatible call */
    console.log(message.slice(0, 500));
    const data = JSON.parse(message);
    const method = data.method;
    const params = data.params;
    const atem = switchers[params.device || 0];

    switch (method) {
      case 'uploadMedia':
        let matches = params.media.match(/^data:(\w+\/\w+);base64,(.*)$/);
        if (matches[1] == 'image/png') {
          const buffer = Buffer.from(matches[2], 'base64');
          atem.uploadStill(data.index, buffer, data.name, data.description)
        } else {
          console.error('Uploaded image is not png');
        }
        break;
      default:
        const command = new Commands[method]();
        if (params.mixEffect)
          command.mixEffect = params.mixEffect;
        if (params.upstreamKeyerId)
          command.upstreamKeyerId = params.upstreamKeyerId;
        if (params.downstreamKeyerId)
          command.downstreamKeyerId = params.downstreamKeyerId;
        if (params.index)
          command.index = params.index;
        command.updateProps(params);
        atem.sendCommand(command);
    }
  });
});

app.listen(config.server.port, config.server.host);
