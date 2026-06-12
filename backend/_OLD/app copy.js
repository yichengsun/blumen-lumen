const server = require('http').createServer();
const io = require('socket.io')(server);
const OSC = require('osc-js');

const plugin = new OSC.BridgePlugin({
    udpClient: { port: 8000, host: '10.2.250.26' }
});
// const plugin = new OSC.WebsocketClientPlugin({
//     port: 8000,
//     host: '10.2.250.26'
//     // host: 'localhost'
// });
const osc = new OSC({ plugin: plugin });
osc.open();
let sendingValue = 1;

// const pluginServer = new OSC.WebsocketServerPlugin({
//     port: 8000,
//     host: '10.2.250.18'
// });
// const oscServer = new OSC({ plugin: pluginServer });

// oscServer.on('/test', message => {
//     console.log('Message at localhost: ', message.args);
// });

function sendSth() {
    const message = new OSC.Message('/2/push16', sendingValue);
    osc.send(message);
    console.log('Sending!');
    sendingValue = !sendingValue;
    if (sendingValue === 1) sendingValue = 0;
    else sendingValue = 1;
}

setInterval(sendSth, 4000);

osc.on('open', message => {
    console.log('Opened! With status:', osc.status());
});
osc.on('error', error => {
    console.log('Error: ', error);
});

io.on('connection', client => {
    let blumen = {
        blumenOpen: 'opened',
        blumenBehavior: 1,
        blumenPalette: [],
        blumenMode: 'default'
    };

    // const message = new OSC.Message('/test', 'message');
    // osc.send(message);
    // console.log('Should be sending anything...');

    client.emit('blumenInitiate', blumen);

    client.on('blumenOpen', data => {
        blumen.blumenOpen = data.blumenOpen;
        let isDefault;

        if (blumen.blumenOpen === 'opened') {
            isDefault = 1;
        } else {
            isDefault = 0;
        }
        console.log('Status of OSC connection: ', osc.status());

        // const message = new OSC.Message('/test', isDefault);
        // osc.send(message);
        // osc.on('ready', function() {

        // });
        console.log('Should send blumenOpen: ', isDefault);
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
        console.log('Status of OSC connection: ', osc.status());

        const message = new OSC.Message('/2/push16', blumen.blumenMode);
        osc.send(message);
        console.log('Should send blumenMode: ', blumen.blumenMode);
    });
});

server.listen(80);

// oscServer.open();
