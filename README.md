# xSocket

##Server:
```javascript
// Init
const xSocket = require('xsocket');

const xServer = new xSocket.Server({
    'port' : 8752, // Port listen
    'socketObjectTimeout' : 30000, // (Not necessary) Allows the user to reconnect within 30 seconds (Default: 0)
    'https' : {
        "cert" : "<path>/cert.pem",
        "key" : "<path>/private.key>"
    }
});

xServer.on('error', (err) => {
    console.log(err);
});

xServer.on('listen', () => {
    console.log('Listen event', xServer.getPort());
});

xServer.on('connect', (xSocketObject) => {

    console.log(
            'Connect event:',
            xSocketObject.getID(), // ID
            xSocketObject.getIP(),  // IP
            xSocketObject.getOrigin(), // Origin url
            xSocketObject.getQuery(), // Clent query (You can transfer data, for example, for authorization)
            xSocketObject.getReqHeaders() // All headers request
    );

    // Data message event
    xSocketObject.on('data', (xSocketData) => {
        console.log(
            'Data event', 
            xSocketData.getID(),   // ID message
            xSocketData.getType(), // Type message
            xSocketData.getData()  // Data
        );

        // Timeout 5s and response
        setTimeout(() => {
            xSocketData.response({'welcome' : 'Hello ' + xSocketObject.getQuery()['name']}).then(function (){
                console.log('Response send success', xSocketData.getID());
            }).catch(function (e) {
                console.log('Response send failed', xSocketData.getID(), e.message);
            });
        }, 5000);
    });

    // Disconnect event
    xSocketObject.on('disconnect', (xSocketObject, message) => {
        console.log('Disconnect event:', xSocketObject.getID(), message);
    });

    // Reconnect event (Only works if 'socketObjectTimeout' is specified)
    xSocketObject.on('reconnect', (xSocketObject) => {
        console.log('Reconnect event:', xSocketObject.getID());
    });

    // Destroy SocketObject
    xSocketObject.on('destroy', (xSocketObject, msg) => {
        console.log('Destroy event:', xSocketObject.getID(), msg);
    });
});

// Listen
xServer.listen().then(() => {
    console.log('Listen then');
}).catch(() => {
    console.log('Listen error', e.message);
});
```



##Client (ECMAScript 5+):


```javascript
// Init 
var xSocket = require('xsocket'); // OR web <script type="text/javascript" src="./xSocket.min.js"></script>

var xClient = new xSocket(['wss://server_domain.com:8752'], {'name' : 'Bob'}); // Or xSocket.Clent()

// Error event
xClient.on('error', function (err) {
    console.log(err);
});

// Connect event
xClient.on('connect', function (xSocketObject) {
    console.log('connect event:', xSocketObject.getID());

    xSocketObject.send(
        'helloServer', // Name message
        {'message' : 'Hello server'}, // Data message
        2000 // TTL (ready connection)
        ).then(function(xSocketData){
            console.log('Client send message #'+xSocketData.getID(), xSocketData.getData());

            xSocketData.on('response', function (data){
               console.log('Server response #'+xSocketData.getID(), data);
            });
    }).catch(function (e){
        console.log('message not send', e.message);
    });
});

// Reconnect event (Only works if 'socketObjectTimeout' is specified)
xClient.on('reconnect', function (xSocketObject) {
    console.log('reconnect event', xSocketObject.getID());
});

// Disconnect event
xClient.on('disconnect', function(xSocketObject, msg) {
    console.log('disconnect', xSocketObject.getID(), msg);
});

// Destroy SocketObject
xClient.on('destroy', function(xSocketObject) {
    console.log('destroy', xSocketObject.getID(), xSocketObject.getSign());
});
```
