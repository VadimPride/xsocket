/**
 * xSocket
 * @licence MIT
 * @author Vadim Pride (pride.mk.ua@gmail.com)
 * @link https://github.com/VadimPride
 */
var xSocket = function xSocket(){
    xSocket.Client.apply(this, arguments);
};
xSocket.window = window;
xSocket.WebSocket = WebSocket;
window.xSocket = xSocket;