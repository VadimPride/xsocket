global.xSocket = function () {
    xSocket.Client.apply(this, arguments);
};
global.xSocket.window = undefined;
global.xSocket.process = process || false;
global.xSocket.WebSocket = require('ws');