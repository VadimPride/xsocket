/**
 * xSocket
 * @licence MIT
 * @author Vadim Pride (pride.mk.ua@gmail.com)
 * @link https://github.com/VadimPride
 */
window.xSocket = function xSocket(){
    xSocket.Client.apply(this, arguments);
};
window.xSocket.WebSocket = WebSocket;
xSocket.helpers = new function helpersObject (){

    /**
     *
     * @param min
     * @param max
     * @returns {number}
     */
    this.getRandInt = function (min, max){
        return Math.floor(min + Math.random() * (max + 1 - min));
    }


    /**
     *
     * @constructor
     */
    this.EventEmitter = function() {
        var $this = this;
        var __listerens = {};
        var __incListeren = 0;
        var __maxListeners = 10;
        var __prefix_once = '_once';


        /**
         * Append EE listeren
         * @param name
         * @param callback
         * @param once
         * @return {EventEmitter}
         */
        this.on = function(name, callback, once) {
            if(typeof name !== 'string' || typeof callback !== 'function'){
                return $this;
            }
            ++__incListeren;

            var i = String(String(__incListeren) + (once === true ? __prefix_once : ''));
            if(typeof __listerens[name] !== 'object'){
                __listerens[name] = {};
            }
            __listerens[name][i] = callback;
            if(__maxListeners > 0 && $this.listenerCount(name) > __maxListeners){
                console.warn('EventEmitter ', name, ', exceeded maxListeners : ', __maxListeners + '/' + $this.listenerCount(name), '. Use EE.setMaxListeners(n)!');
            }
            return $this;
        };

        /**
         * Apend once EE listeren
         * @param name
         * @param callback
         * @return {EventEmitter}
         */
        this.once = function(name, callback){
            return $this.on(name, callback, true);
        };

        /**
         * Getter all listeren name
         * @returns {string[]}
         */
        this.getListerensName = function(){
            return Object.keys(__listerens);
        };

        /**
         * Clear all listeren
         * @returns {{}}
         */
        this.clearAllListerens = function(){
            var listerens = $this.getListerensName();
            for(var i in listerens){
                $this.offAll(listerens[i]);
            }
            return __listerens;
        };

        /**
         * Getter count Event listeren
         * @param name
         * @returns {number}
         */
        this.listenerCount = function(name){
            var count = 0;
            if(typeof name !== 'string' || typeof __listerens[name] !== 'object'){
                return count;
            }
            return Object.keys(__listerens[name]).length;
        };

        /**
         * Set max listeners
         * @param count
         * @returns {boolean}
         */
        this.setMaxListeners = function(count){
            if(typeof count !== 'number'){
                return false;
            }
            __maxListeners = parseInt(count);
            return true;
        };

        /**
         * Delete EventEmitter listeren
         * @param name
         * @param callback
         * @return {EventEmitter}
         */
        this.off = function(name, callback){

            if(typeof name !== 'string' || typeof callback !== 'function' || typeof __listerens[name] !== 'object'){
                return $this;
            }
            for(var i in __listerens[name]){
                if(__listerens[name][i] === callback){
                    delete __listerens[name][i];
                }
            }
            if(Object.keys(__listerens[name]).length === 0){
                delete __listerens[name];
            }
            return $this;
        };

        /**
         * Delete all EventEmitter listeren
         * @param name
         * @return {EventEmitter}
         */
        this.offAll = function(name){
            if(typeof __listerens[name] !== 'object'){
                return $this;
            }
            for(var i in __listerens[name]){
                delete __listerens[name][i];
            }
            delete __listerens[name];
            return $this;
        };

        /**
         * Emit EE listeren
         * @param name
         * @param data_1
         * @param data_2
         * @param data_3
         * @param data_4
         * @param data_5
         * @return {EventEmitter}
         */
        this.emit = function(name, data_1, data_2, data_3, data_4, data_5){
            if(typeof name !== 'string' || typeof __listerens[name] !== 'object'){
                return $this;
            }
            for(var i in __listerens[name]){
                if(typeof __listerens[name][i] === 'function'){
                    __listerens[name][i].call(this, data_1, data_2, data_3, data_4, data_5);
                    if(i.indexOf(__prefix_once) >= 0){
                        $this.off(name, __listerens[name][i]);
                    }
                }
            }
            return $this;
        };
    };

    this.getUID = function (){
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c,r){return ('x'== c ? ( r = Math.random()*16|0) : (r&0x3|0x8)).toString(16);});
    };

    /**
     *
     * @param uid
     * @returns {boolean}
     */
    this.checkUID = function (uid){
        return !!(new RegExp("^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")).test(String(uid));
    };
};

xSocket.Data = function xSocketData(__isOutput){

    xSocket.helpers.EventEmitter.call(this);
    this.setMaxListeners(0);

    var $this     = this;
    this.__ID      = ''
    this.__type    = '';
    this.__data    = {};
    this.__resData = {};
    this.__status  = 0;
    this.__destroy = false;

    /**
     *
     * @returns {string}
     */
    this.getID = function (){
        return String(this.__ID);
    };

    /**
     *
     * @returns {string}
     */
    this.getType = function (){
        return String(this.__type);
    };

    /**
     *
     * @returns {{}}
     */
    this.getData = function (){
        return this.__data || {};
    };

    /**
     *
     * @returns {{}}
     */
    this.getResData = function (){
        return this.__resData;
    };

    /**
     *
     * @returns {number}
     */
    this.getStatus = function (){
        return parseInt(this.__status);
    };

    /**
     *
     * @returns {boolean|*|string}
     */
    this.getDestroy = function (){
        return this.__destroy || false;
    }

    /**
     *
     * @param data
     * @returns {Promise}
     */
    this.response = function (data){
        return new Promise(function (){
            throw new Error('This SocketData is output, use response event');
        });
    };

    /**
     *
     * @param msg
     * @returns {boolean}
     */
    this.destroy = function (msg){
        if(this.getDestroy()){
            return false;
        }
        this.__destroy = String(typeof msg === 'string' && msg.length ? msg :  'destroy');
        if(this.__status !== xSocket.Data.STATUS_RESPONCE){
            $this.emit('response', {}, this.__destroy);
        }
        this.emit('destroy', $this);
        // Clear all events
        this.clearAllListerens();
    };

    /**
     *
     */
    (function (){
        var destroyTimeout = setTimeout(function ($this){
            $this.destroy('responseTimeout');
        }, 10000, $this);
        $this.once('destroy', function (){
            try{
                clearTimeout(destroyTimeout);
            }catch (e){}
        });
        $this.once('response', function (data){
            $this.__status = xSocket.Data.STATUS_RESPONCE;
            $this.__resData = data;
            $this.destroy('response');
        });
    })();

};
xSocket.Data.STATUS_NEW      = 0;
xSocket.Data.STATUS_SEND     = 1;
xSocket.Data.STATUS_RESPONCE = 2;

xSocket.xSocketObject = function (__isServer, __req){

    // Extend
    xSocket.helpers.EventEmitter.call(this);
    this.setMaxListeners(0);

    var $this             = this;
    var __ws              = undefined;
    var __ID              = '';
    var __sign            = '';
    var __destroy         = undefined;
    var __isNewConnection = true;
    var __socketDataList      = {};
    var __query = {};

    /**
     *
     * @returns {string}
     */
    this.getID = function (){
        return __ID || '';
    };

    /**
     *
     * @returns {string}
     */
    this.getSign = function (){
        return __sign || '';
    };

    /**
     *
     * @returns {*|{}}
     */
    this.getReq = function (){
        return __req || {};
    };

    /**
     *
     * @returns {*}
     */
    this.getQuery = function (){
        return typeof __query === 'object' ? __query : {};
    }

    /**
     *
     * @param key
     * @param def
     * @returns {*}
     */
    this.getQueryVal = function (key, def){
        return this.getQuery()[key] || def;
    };

    /**
     *
     * @returns {*|{}}
     */
    this.getReqHeaders = function (){
        return this.getReq()['headers'] || {}
    };

    /**
     *
     * @returns {*|string}
     */
    this.getOrigin = function (){
        return this.getReqHeaders()['origin'] || 'unknown';
    };

    /**
     *
     * @returns {string}
     */
    this.getIP = function (){
        return String((this.getReq()['connection'] || {})['remoteAddress'] || 'unknown');
    };


    /**
     *
     * @returns {{}}
     */
    this.getSocketDataList = function (){
        return __socketDataList;
    };

    /**
     *
     * @param ID
     * @returns {*|boolean}
     */
    this.getSocketData = function (ID){
        return this.getSocketDataList()[ID] || false;
    };

    /**
     *
     * @returns {boolean}
     */
    this.isConnection = function (){
        return typeof __ws == 'object' ? __ws.isConnection() : false;
    };

    /**
     *
     * @returns {any|boolean}
     */
    this.getConnection = function (){
        return this.isConnection() ? __ws : false;
    };

    /**
     *
     * @returns {any|boolean}
     */
    this.getDestroy = function (){
        return __destroy || false;
    };

    /**
     *
     * @returns {Promise}
     */
    this.getWsReady = function (){
        return new Promise(function(resolve, reject) {
            if($this.getConnection()){
                return resolve($this.getConnection());
            }
            const destroyHandler = function(){
                reject(new Error('destroy'));
            };
            $this.on('connect', function(){
                if($this.getConnection()){
                    resolve($this.getConnection());
                }else{
                    reject(new Error('Failed connection #10fg42w'))
                }
                $this.off('destroy', destroyHandler);
            });
            $this.once('destroy', destroyHandler);
        });
    };

    /**
     *
     * @param type
     * @param data
     * @param ttl
     * @returns {Promise}
     */
    this.send = function (type, data, ttl){
        var p = new Promise(function (resolve, reject) {
            if(typeof type !== 'string' || !type.length){
                throw new Error('Invalid type value');
            }
            if(typeof data !== 'object'){
                throw new Error('Invalid data value');
            }
            ttl = parseInt(ttl || 4000);
            if(typeof ttl !== 'number' || ttl !== ttl || ttl < 0){
                throw new Error('Invalid ttl value');
            }
            var socketData = new xSocket.Data(true);
            socketData.__ID = xSocket.helpers.getUID();
            socketData.__type = type;
            socketData.__data = data;
            __socketDataList[socketData.getID()] = socketData;
            socketData.on('destroy', function (socketData){
                delete __socketDataList[socketData.getID()];
                return reject(new Error('ttl'));
            });
            var timeout = setTimeout(function (){
                socketData.destroy('ttl');
            }, ttl);
            $this.getWsReady().then(function (ws){
                if(ttl && socketData.getDestroy() === 'ttl'){
                   return reject(new Error('ttl'));
                }
                if(ws.sendObject(['SD|create',
                    {
                        'ID' : socketData.getID(),
                        'type' : socketData.getType(),
                        'data' : socketData.getData()
                    }
                ])){
                    resolve(socketData);
                    try{clearTimeout(timeout);}catch (e){}
                }else{
                    var msg = 'Failed send #54te8ta65';
                    reject(new Error(msg));
                    socketData.destroy(msg);
                }
            }).catch(function (e){
                reject(e);
            });
        });
        p.catch(function (){});
        return p;
    };

    /**
     *
     * @param method
     * @param data
     * @param ttl
     * @returns {Promise<object>}
     */
    this.sendReadyResponse = function (method, data, ttl){
        return new Promise(function (resolve, reject){
            $this.send(method, data, ttl).then((xSocketData) => {
                xSocketData.on('response', function (data, err){
                    if(err){
                        return reject(new Error(err));
                    }
                    resolve(data);
                });
            }).catch(function (e){
                reject(e);
            })
        });
    }

    /**
     *
     * @param msg
     * @returns {boolean}
     */
    this.destroy = function (msg){
        if(__destroy){
            return false;
        }
        __destroy = String(msg || 'destroy');
        this.disconnect(__destroy);
        this.emit('destroy', this, __destroy);
        // Clear all events
        this.clearAllListerens();
        return true
    };

    /**
     *
     * @param msg
     * @returns {boolean}
     */
    this.disconnect = function (msg){
        var ws = this.getConnection();
        if(!ws || !this.isConnection()){
            return false;
        }
        return ws.closeConnection(msg);
    };

    /**
     *
     * @param ws
     * @returns {boolean}
     */
    this.update = function (ws){
        if(typeof ws !== 'object' || typeof ws.isConnection !== 'function' || typeof ws.query !== 'object'){
            return false;
        }
        if(!ws.isConnection() || __destroy){
            return false;
        }
        if(__ID !== ws.query['xSOId'] || __sign !== ws.query['xSOSign']){
            __ID   = ws.query['xSOId'];
            __sign = ws.query['xSOSign'];
            __query = Object(ws['query'] || {});
            if(__query['xSOId']) delete  __query['xSOId'];
            if(__query['xSOSign']) delete  __query['xSOSign'];
            if(!__isServer){
                $this.emit('update', $this);
            }
        }
        __ws = ws;
        ws.SocketObject = ws;
        $this.emit('ws|connect', ws);
        return true;
    };

    /**
     *
     */
    (function (){
        $this.on('update', function (){
            var SDlist = $this.getSocketDataList();
            for(var i in SDlist){
                try{
                    SDlist[i].destroy('SocketObject|destroy');
                }catch (e){}
            }
        });
        $this.on('ws|disconnect', function (msg){
            $this.emit('disconnect', $this, String(msg || ''));
            if(msg === 'end'){
                $this.destroy('end');
            }
        });
        $this.on('ws|connect', function (){
            $this.emit('connect', $this);
            if(!__isNewConnection){
                $this.emit('reconnect', $this);
            }else{
                __isNewConnection = false;
            }
        });
        $this.on('ws|message', function (type, data){
            if(
                typeof type !== 'string' ||
                !type.length ||
                typeof data !== 'object' ||
                typeof data['ID'] !== 'string' ||
                !xSocket.helpers.checkUID(data['ID']) ||
                !data['ID'].length ||
                typeof data['data'] !== 'object'
            ){
                return;
            }
            var socketData;
            if(type === 'SD|create'){
                if(typeof data['type'] == 'string' && data['type'].length || !$this.getSocketData(data['ID'])){
                    socketData = new xSocket.Data();
                    socketData.__ID   = String(data['ID']);
                    socketData.__type = String(data['type']);
                    socketData.__data = Object(data['data']);
                    socketData.response = function (data){
                        var p = new Promise(function (resolve, reject){
                            if(typeof data !== 'object'){
                                return reject(new Error('Invalid data object'));
                            }
                            $this.getWsReady().then(function (ws){
                                if(ws.sendObject(['SD|update', {
                                        'ID' : socketData.getID(),
                                        'data' : data
                                    }
                                ])){
                                    resolve(socketData);
                                    socketData.destroy();
                                }else{
                                    reject(new Error('Failed send'));
                                }
                            }).catch(function (e){
                                reject(e);
                            });
                        });
                        p.catch(function(){});
                        return p;
                    };
                    $this.emit('data', socketData);
                    $this.emit('|'+socketData.getType(), socketData);
                }
            }else if(type === 'SD|update'){
                socketData = $this.getSocketData(data['ID']);
                if(socketData){
                    socketData.emit('response', data['data'], false);
                }
            }
        });
    })();
};

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
            var msgInc = 0;
            var pingTimeout = setInterval(function (){
                ws.sendMessage('ping');
            }, 10000);
            var pongTimeout = setInterval(function (){
                if(!msgInc){
                    ws.closeConnection('pongTimeout');
                }
                msgInc = 0;
            }, 23000);
            ws.onmessage = function (e){
                msgInc++;
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
                try{ clearInterval(pingTimeout); }catch (e){}
                try{ clearInterval(pongTimeout); }catch (e){}
                __ws = undefined;
                msg = msg || e.reason || 'close';
                __SocketObject.emit('ws|disconnect', msg);
                $this.emit('ws|disconnect', msg);
            };
        });
    };

    this.isNode = function (){
        return global && process;
    };

    /**
     *
     * @returns {Promise<xSocket.Data>}
     */
    this.send = function (){
        return __SocketObject.send.apply(this, arguments);
    };

    /**
     *
     * @returns {Promise<object>}
     */
    this.sendReadyResponse = function (){
        return __SocketObject.sendReadyResponse.apply(this, arguments);
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
        __SocketObject.on('ws|error', function (e,q){
            $this.emit('error', e, q);
        });
        __SocketObject.on('data', function (xSocketData){
            $this.emit('data', xSocketData);
        })
        $this.getConnection()['catch'](function (e){
            console.error(e);
        });
        if(!$this.isNode()){
            window.addEventListener("unload", function() {
                try{
                    __ws.closeConnection('end');
                }catch (e){}
            });
        }
    })();

};
