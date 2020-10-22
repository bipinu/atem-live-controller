const express    = require('express');
const fileUpload = require('express-fileupload');
const ATEM = require('applest-atem');
const FileUploader = ATEM.FileUploader
const config     = require('../config.json');
const fs         = require('fs');
const nodeStorage = require("node-persist");
const axios = require('axios').default;
const ciao = require("@homebridge/ciao");
const SerialPort = require('serialport')
// const Readline = require('@serialport/parser-readline')
const port = new SerialPort("/dev/tty.SLAB_USBtoUART", { baudRate: 115200 })

const responder = ciao.getResponder();
const httpService = responder.createService({
  name: 'ATEM Controller',
  hostname: 'atem-daddy',
  type: 'http',
  port: 8080
});

httpService.advertise().then(() => {
  // stuff you do when the service is published
  console.log("service is published :)");
});

initiateNodeStorage().then(() => {
  console.info("Storage Initiated");
});

const app = express();
var expressWs = require('express-ws')(app);

async function initiateNodeStorage(){
  await nodeStorage.init();
}

let atem;
const switchers = [];

let CLIENTS = expressWs.getWss().clients;

let device = 0;
for (var switcher of config.switchers) {
  console.log('Initializing switcher', switcher.addr, switcher.port)
  atem = new ATEM;
  atem.event.setMaxListeners(5);
  atem.connect(switcher.addr, switcher.port);
  atem.state.device = device;
  switchers.push(atem);

  atem.on('stateChanged', (err, state) => {
    console.log('atem stateChanged')
    broadcast(JSON.stringify(state));
    updateEsp32s(state);
  })
  atem.on('connect', (err) => {
    console.log('atem connected');
    broadcast(JSON.stringify({ method: 'connect', device: atem.device }));
  })
  atem.on('disconnect', (err) => {
    console.log('atem disconnected');
    broadcast(JSON.stringify({ method: 'disconnect', device: atem.device }));
  })
  device += 1;
}

function broadcast(message) {
  for (var client of CLIENTS) {
    client.send(message);
  }
}

async function updateEsp32s(state) {
  console.log("updating ESP32s...");
  // var previewInput = state.video.ME[0].previewInput;
  // var programInput = state.video.ME[0].programInput;
  // console.info(typeof state.tallys);
  console.info(state.tallys);
  // console.info(state.tallys.0);
  let tally = state.tallys;
  // console.info(typeof tallyString);
  // let tallyArray = tallyString.split(",");

  for(let counter = 0; counter < 4; counter++){
    if(tally[counter] == 2){
      var previewInput = counter+1;
    }else if(tally[counter] == 1){
      var programInput = counter+1;
    }
  }

  // console.log("Tallys: " + state.tallys + "Preview: " + previewInput + " & Program: " + programInput);
  // let serialData = "preview/"+previewInput+"/program/"+programInput;
  let serialData = previewInput+""+programInput;
  console.info("Serial Data to be sent: " +serialData);
  port.write(serialData, function(err) {
    if (err) {
      return console.log('Error on write: ', err.message)
    }
    console.log('message written')
  })
  return;
  console.log(await nodeStorage.values());

      url = "http://atem-master.local/esp32/updateLED/preview/"+previewInput+"/program/"+programInput;
      console.info("URL to be invoked: "+url);
      axios.get(url)
      .then(function (response) {
        console.log("Invoked: "+ url);
      }).catch(function (error) {
        console.log("Error while invoking: "+ url);
      }).then(function (){
          console.log("Why even here?: "+ url);
      });
}

async function getCamUrl(){
  let ipAddresses = await nodeStorage.values();
  return ipAddresses;
}

app.get("/update_cam_id/cam/:camId/ip/:ip", function (req, resp) {
  var camId = req.params.camId;
  var ipaddress = req.params.ip;
  console.info("Camera Id: "+camId + " & IP Address: "+ipaddress);
  updateCamIp(camId, ipaddress).then(() => {
    console.log("Ip updated");
  });
});

async function updateCamIp(camId, ipaddress){
  let storageStatus = await nodeStorage.setItem(camId, ipaddress);
  console.log(await nodeStorage.values());
  return storageStatus;
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
    ws.send(JSON.stringify(atem.state));
  }

  ws.on('message', function incoming(message) {
    /* JSON-RPC v2 compatible call */
    console.log(message.slice(0, 500));
    const data = JSON.parse(message);
    const method = data.method;
    const params = data.params;
    const atem = switchers[params.device || 0];

    switch (method) {
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
        atem[method](params.number, params.state);
      break;
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
      case 'runMacro':
        atem[method](params.number);
      break;
      case 'uploadMedia':
        let matches = params.media.match(/^data:(\w+\/\w+);base64,(.*)$/);
        if (matches[1] == 'image/png') {
          const buffer = Buffer.from(matches[2], 'base64');
          // fs.writeFileSync('media'+number+'.png', buffer);
          const fileUploader = new FileUploader(atem);
          fileUploader.uploadFromPNGBuffer(buffer, params.number);
        } else {
          console.error('Uploaded image is not png');
        }
      break;
    }
  });
});

app.listen(config.server.port, config.server.host);
