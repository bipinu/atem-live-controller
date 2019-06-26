# ATEM Live Controller
The customizable video switchers web controller.

# Features
- Switching program/preview inputs
- keyboard shortcuts as in original ATEM switchers app: 1-8 changes preview, Ctrl+1-8 changes program, Spacebar for CUT transition and Enter for AUTO transition.
- websocket communication with server for more efficient and faster reactions
- Svelte reactive frontend for simpler development
- HTTP API for integration with other apps

# Installation
- Copy `config.json.sample` to `config.json`
- Install dependencies with npm `pnpm install
- Prepare assets with webpack

```sh
cp config.json.sample config.json
npm install
```

# Run
- Run the app server

```sh
npm start
```
or 
```sh
node ./src/server.js
```
or
run with [PM2](http://pm2.keymetrics.io/)
```sh
pm2 start process.yml
```
Then go to this address in your browser: `http://localhost:8080/`

# Screenshots
![](docs/ipad-mini-demo.png)

# Contributing
1. Fork it ( https://github.com/filiphanes/atem-live-controller )
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Implement your feature
4. Commit your changes (`git commit -am 'Add some feature'`)
5. Push to the branch (`git push origin my-new-feature`)
6. Create new Pull Request

# License
The MIT License (MIT)

Copyright (c) 2019 Filip Hanes

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

# Thanks
- Font made by "とろ庵" http://www.trojanbear.net/s/category/font
- svelte framework
- applest-atem library for communication with atem hardware

# TODO
- media upload on its own tab
- show connection status to server.js and to device
- settings tab
- support more atem functionality