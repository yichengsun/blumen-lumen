const server = require('http').createServer();
const io = require('socket.io')(server);

const { Client } = require('node-osc');

// MadMapper runs on this same machine — use localhost so this works
// regardless of what IP the NUC is assigned on the network.
const oscClient = new Client('127.0.0.1', 8000);

// TODO: Replace TBD with ESP32's DHCP-reserved IP once Stanford IT provides it.
const oscClientEngine = new Client('TBD', 8001);

// TODO (multi-user): Each connected client gets its own independent blumen state
// object, so two phones can issue conflicting motor commands simultaneously.
// For a single-user setup this is fine. For classroom use, consider lifting
// shared state above the connection handler so all clients see the same position.

io.on('connection', client => {
    let blumen = {
        blumenMode: 'default',
        blumenBehavior: 'circular',
        blumenOpenLevel: 0,
        blumenColorPalette: 0
    };

    console.log('Client connected');
    client.emit('blumenInitiate', blumen);

    client.on('disconnect', () => {
        console.log('Client disconnected');
    });

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

server.on('error', (err) => {
    if (err.code === 'EACCES') {
        console.error('ERROR: Port 80 requires Administrator privileges.');
        console.error('Right-click blumen-startup.bat and choose "Run as administrator".');
    } else if (err.code === 'EADDRINUSE') {
        console.error('ERROR: Port 80 is already in use. Is another server running?');
    } else {
        console.error('Server error:', err);
    }
    process.exit(1);
});

server.listen(80, () => {
    console.log('Blumen backend listening on port 80');
});
