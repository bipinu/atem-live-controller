const express    = require('express');
const fileUpload = require('express-fileupload');
const ATEM = require('applest-atem');
const FileUploader = ATEM.FileUploader
const config     = require('../config.json');
const fs         = require('fs');
const nodeStorage = require("node-persist");
const axios = require('axios').default;
const ciao = require("@homebridge/ciao");

const responder = ciao.getResponder();
const httpService = responder.createService({
  name: 'ATEM Controller',
  hostname: 'atem-daddy',
  type: 'http',
  port: 8080
});

var previewCam = 0;
var programCam = 0;

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
  var previewInput, programInput;

  // let tally = state.tallys;
  // for(let counter = 0; counter < 4; counter++){
  //   if(tally[counter] == 2){
  //     previewInput = counter+1;
  //   }else if(tally[counter] == 1){
  //     programInput = counter+1;
  //   }
  // }

  previewInput = state.video.ME[0].previewInput;
  programInput = state.video.ME[0].programInput;
  console.log("Tallys: " + state.tallys + "Preview: " + previewInput + " & Program: " + programInput);

  if (previewInput == previewCam && programInput == programCam) {
    console.info("Camera's haven't changed...");
    return;
  }

  previewCam = previewInput;
  programCam = programInput;

  getCamUrl().then(ipAddresses => {
    var url, urls = [];
    ipAddresses.forEach(function (ipAddress){
      url = "http://"+ipAddress+"/esp32/updateLED/preview/"+previewInput+"/program/"+programInput;
      console.info("URL to be invoked: "+url);
      axios.get(url)
      .then(function (response) {
        console.log("Invoked: "+ url);
      }).catch(function (error) {
        console.log("Error while invoking: "+ url);
      }).then(function (){
          console.log("Why even here?: "+ url);
      });
      urls.push(url);
    });
    console.log(urls)
  });
}

async function getCamUrl(){
  let ipAddresses = await nodeStorage.values();
  return ipAddresses;
}

async function removeEntry(key){
  console.info(await nodeStorage.keys());
  console.info(await nodeStorage.removeItem(key));
  console.info(await nodeStorage.values());
}

app.get("/remove/cam/:camId", function (req, resp) {
  var camId = req.params.camId;
  removeEntry(camId);
});

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
