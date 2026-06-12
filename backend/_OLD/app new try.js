const server = require('http').createServer();
const io = require('socket.io')(server);
const osc = require('osc');

// const plugin = new OSC.WebsocketClientPlugin({
//     port: 8000,
//     // host: '10.2.250.18'
//     host: 'localhost'
// });
// const osc = new OSC({ plugin: plugin });

const oscPort = new osc.WebSocketPort({
    url: 'ws://localhost:8000', // URL to your Web Socket server.
    metadata: true
});

console.log(oscPort.status());

io.on('connection', client => {
    let blumen = {
        blumenOpen: 'opened',
        blumenBehavior: 1,
        blumenPalette: [],
        blumenMode: 'default'
    };

    client.emit('blumenInitiate', blumen);

    client.on('blumenOpen', data => {
        blumen.blumenOpen = data.blumenOpen;
        let isDefault;

        if (blumen.blumenOpen === 'opened') {
            isDefault = 1;
        } else {
            isDefault = 0;
        }
    });

    client.on('blumenBehavior', data => {
        blumen.blumenBehavior = data.blumenBehavior;
        console.log(blumen.blumenBehavior);
    });

    client.on('blumenColorPalette', data => {
        blumen.blumenColorPalette = data.blumenColorPalette;
        console.log(blumen.blumenColorPalette);
    });

    client.on('blumenMode', data => {
        blumen.blumenMode = data.blumenMode;

        oscPort.on('ready', function() {
            oscPort.send({
                address: '/test',
                args: [
                    {
                        type: 'f',
                        value: blumen.blumenMode
                    }
                ]
            });
        });

        console.log('Should send blumenMode: ', blumen.blumenMode);
    });
});

server.listen(80);

oscPort.open();
