/**
 * xSocket
 * @licence MIT
 * @author Vadim Pride (pride.mk.ua@gmail.com)
 * @link https://github.com/VadimPride
 */
var xSocket = function xSocket(){
    xSocket.Client.apply(this, arguments);
};
xSocket.window = window || false;
xSocket.WebSocket = WebSocket || false;
xSocket.process = false;

window.xSocket = xSocket;