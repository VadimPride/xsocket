global.xSocket = function () {
    xSocket.Client.apply(this, arguments);
};

global.xSocket.WebSocket = require('ws');