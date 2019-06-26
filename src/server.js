const express    = require('express');
const fileUpload = require('express-fileupload');
const ATEM       = require('applest-atem');
const config     = require('../config.json');

const app = express();
var expressWs = require('express-ws')(app);

let atem;
const switchers = [];

let CLIENTS = expressWs.getWss().clients;

let device = 0;
for (var switcher of config.switchers) {
  atem = new ATEM;
  atem.event.setMaxListeners(5);
  atem.connect(switcher.addr, switcher.port);
  atem.state.device = device;
  switchers.push(atem);

  atem.on('stateChanged', (err, state) => {
    for (var client of CLIENTS) {
      client.send(JSON.stringify({ switchers: [state] }));
    }
  })

  device += 1;
}

app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
}));

app.post('/uploadMedia', function (req, res) {
  console.log(req.files.media); // the uploaded file object
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.');
  }
  let fileUploader = new ATEM.FileUploader(switchers[0]);
  fileUploader.uploadFromPNGBuffer(req.files.media.data, req.params.bankIndex || 0);
  return res.status(200).send('Media was successfuly uploaded.');
});

app.use(express.static(__dirname + '/../public', {
  index: 'index.html',
}));

app.ws('/ws', function(ws, req) {
  const ip = req.connection.remoteAddress;
  console.log(ip, 'connected');
  // initialize client with all switchers
  for (var atem of switchers) {
    client.send(JSON.stringify(atem.state));
  }

  ws.on('message', function incoming(message) {
    /* JSON-RPC v2 compatible call */
    console.log(message);
    const data = JSON.parse(message);
    const params = data.params;
    const atem = switchers[params.device || 0];

    switch (data.method) {
      case 'changePreviewInput':
      case 'changeProgramInput':
        atem[method](params.input);
      break;
      case 'autoTransition':
      case 'cutTransition':
      case 'fadeToBlack':
        atem[method]();
      break;
      case 'changeUpstreamKeyState':
      case 'changeUpstreamKeyNextState':
      case 'changeDownstreamKeyOn':
      case 'changeDownstreamKeyTie':
        atem[method](params.number, params.state);
      break;
      case 'changeTransitionPreview':
        atem[method](params.state, params.me);
      break;
      case 'changeTransitionPosition':
        atem[method](params.position);
      break;
      case 'changeTransitionType':
        atem[method](params.type);
      break;
      case 'changeUpstreamKeyNextBackground':
        atem[method](params.state);
      break;
      case 'autoDownstreamKey':
        atem[method](params.number);
      break;
    }
  });
});

app.listen(8080);
