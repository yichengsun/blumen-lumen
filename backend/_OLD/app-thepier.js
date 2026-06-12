const server = require('http').createServer();
const io = require('socket.io')(server);

const { Client } = require('node-osc');

const oscClient = new Client('10.2.250.43', 8000);

//OSC communication for the engine. TODO add IP
const oscClientEngine = new Client('10.2.250.248', 8001);

console.log('Sending OSC on: /2/default');
oscClient.send('/2/default', 1);

io.on('connection', client => {
    let blumen = {
        blumenMode: 'default',
        blumenBehavior: 'circular',
        blumenOpenLevel: 100,
        blumenColorPalette: 0
    };

    client.emit('blumenInitiate', blumen);

    client.on('blumenMode', data => {
        blumen.blumenMode = data.blumenMode;
        console.log('BlumenMode changed to: ', data.blumenMode);

        if (blumen.blumenMode === 'custom') {
            console.log(
                `Sending OSC on: /2/${blumen.blumenBehavior}_p${blumen.blumenColorPalette}`
            );
            oscClient.send(
                `/2/${blumen.blumenBehavior}_p${blumen.blumenColorPalette}`,
                1
            );
        } else {
            console.log(`Sending OSC on: /2/default`);
            oscClient.send(`/2/default`, 1);
        }
    });

    client.on('blumenBehavior', data => {
        blumen.blumenBehavior = data.blumenBehavior;

        if (blumen.blumenMode === 'custom') {
            console.log('BlumenBehavior changed to: ', blumen.blumenBehavior);
            console.log(
                `Sending OSC on: /2/${blumen.blumenBehavior}_p${blumen.blumenColorPalette}`
            );
            oscClient.send(
                `/2/${blumen.blumenBehavior}_p${blumen.blumenColorPalette}`,
                1
            );
        }
    });

    client.on('blumenOpenLevel', data => {
        blumen.blumenOpenLevel = data.blumenOpenLevel;

        if (blumen.blumenMode === 'custom') {
            console.log(
                `Sending OSC on: /1/fader1 with ${blumen.blumenOpenLevel}`
            );

            //OSC communication for the engine. TODO change message
            oscClientEngine.send(`/1/fader1`, blumen.blumenOpenLevel);
        }
    });

    client.on('blumenColorPalette', data => {
        blumen.blumenColorPalette = data.blumenColorPalette;
        if (blumen.blumenMode === 'custom') {
            console.log(
                'BlumenPalette changed to: ',
                blumen.blumenColorPalette
            );
            console.log(
                `Sending OSC on: /2/${blumen.blumenBehavior}_p${blumen.blumenColorPalette}`
            );

            oscClient.send(
                `/2/${blumen.blumenBehavior}_p${blumen.blumenColorPalette}`,
                1
            );
        }
    });
});

server.listen(80);
