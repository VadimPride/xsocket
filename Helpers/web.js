/**
 * xSocket
 * @licence MIT
 * @author Vadim Pride (pride.mk.ua@gmail.com)
 * @link https://github.com/VadimPride
 */
window.xSocket = function xSocket(){
    xSocket.Client.apply(this, arguments);
};
window.xSocket.window = window;
window.xSocket.WebSocket = WebSocket;