xSocket.Client = function xSocketClient(__urlList, __query, __settings){

    // Extend
    xSocket.helpers.EventEmitter.call(this);
    this.setMaxListeners(0);

    var $this = this;
    var __ws;
    var __SocketObject = new xSocket.xSocketObject();

    /**
     *
     * @returns {{}}
     */
    this.getSettings = function(){
        return __settings || {};
    };

    /**
     *
     * @param key
     * @param def
     * @returns {*}
     */
    this.getSettingsVal = function (key, def){
        return this.getSettings()[key] || def;
    };

    /**
     *
     * @returns {xSocket.xSocketObject}
     */
    this.getSocketObject = function (){
        return __SocketObject;
    };

    /**
     *
     * @returns {Promise}
     */
    this.getConnection = function (){
        return new Promise(function (resolve, reject) {
            if(typeof __ws === 'object'){
                return resolve(__ws);
            }
            if(__ws === null){
                return $this.once('ws|connect', function (ws){
                    resolve(ws);
                });
            }
            __ws = null;
            var url = __urlList.length > 1 ? xSocket.helpers.getRandInt(0, __urlList.length - 1) : __urlList[0];
            console.log(url);
            url += (url.indexOf('?') === -1 ? '?' : '&');
            if(__SocketObject.getID().length && __SocketObject.getSign().length){
                __query['xSOId'] = String(__SocketObject.getID());
                __query['xSOSign'] = String(__SocketObject.getSign());
            }
            if(Object.keys(__query).length){
                for (var i in __query){
                    url += String(i)+'='+String(__query[i])+'&';
                }
            }
            var ws = new xSocket.WebSocket(url);
            ws.closeConnection = function (msg){
                if(ws.isConnection()){
                    try{
                        ws.close(1000, String(msg || 'close'));
                        return true;
                    }catch (e){
                        console.error(e);
                    }
                }
                return false;
            };
            ws.isConnection = function (){
                return ws.readyState === 1;
            };
            ws.sendMessage = function (msg){
                try{
                    if(this.isConnection()){
                        ws.send(String(msg));
                        return true;
                    }
                }catch (e){}
                return false;
            };
            ws.sendObject = function(object) {
                try {
                    if(ws.isConnection()){
                        ws.send(JSON.stringify(object));
                        return true;
                    }
                }catch (e){}
                return false;
            };
            ws.query = {};
            ws.onopen = function (){
              __ws = ws;
              $this.emit('ws|connect', ws);
            };
            var msg;
            var isAuth = false;
            ws.onerror = function (e){
                msg = e.message;
                $this.emit('ws|error', e.message, ws);
            };
            ws.onmessage = function (e){
                var msg = String(e.data || '');
                if(msg === 'pong'){
                    return;
                }
                try{
                    var body = JSON.parse(msg);
                    if(typeof body === 'object' && typeof body[0] === 'string' && typeof body[1] === 'object'){
                        if(body[0] === 'SO|update'){
                            ws.query = body[1];
                            if(__SocketObject.update(ws)){
                                isAuth = true;
                            }else{
                                ws.closeConnection('update');
                            }

                            return;
                        }
                        if(isAuth){
                            __SocketObject.emit('ws|message', body[0], body[1]);
                        }
                    }
                }catch (e){}
            };
            ws.onclose = function (e){
                __ws = undefined;
                msg = msg || e.reason || 'close';
                if(isAuth){
                    __SocketObject.emit('ws|disconnect', msg);
                }
                $this.emit('ws|disconnect', msg);
            };
        });

    };

    /**
     *
     * @param msg
     * @returns {*}
     */
    this.disconnect = function (msg){
        return this.getSocketObject().disconnect(msg);
    };

    /**
     * Construct
     */
    (function (){
        __urlList = typeof __urlList === "object" ? __urlList : [];
        if(!__urlList.length){
            throw new Error('Invalid urlList');
        }
        __settings = typeof __settings === 'object' ? __settings : {};
        __query     = typeof __query === 'object' ? __query : {};
        $this.on('ws|disconnect', function(){
            setTimeout(function(){
                    $this.getConnection()['catch'](function (){});
            }, 1000);
        });
        __SocketObject.on('connect', function (SocketObject){
            $this.emit('connect', SocketObject);
        });
        __SocketObject.on('disconnect', function (SocketObject, msg){
            $this.emit('disconnect', SocketObject, msg);
        });
        __SocketObject.on('reconnect', function (SocketObject){
            $this.emit('reconnect', SocketObject);
        });
        __SocketObject.on('update', function (SocketObject){
            $this.emit('update', SocketObject);
        });
        $this.getConnection()['catch'](function (e){
            console.error(e);
        });
    })();

};
