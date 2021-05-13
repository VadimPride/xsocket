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
     * @returns {boolean}
     */
    this.isDestroy = function (){
        return !!this.getDestroy();
    }

    /**
     *
     * @returns {Promise}
     */
    this.getWsReady = function (){
        return new Promise(function(resolve, reject) {
            if($this.getConnection()){
                return resolve($this.getConnection());
            }
            var destroyHandler = function(){
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
     * @param type
     * @param data
     * @param ttl
     * @returns {Promise<object>}
     */
    this.sendReadyResponse = function (type, data, ttl){
        return new Promise(function (resolve, reject){
            $this.send(type, data, ttl).then(function(xSocketData) {
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
    };

    /**
     *
     * @param type
     * @param data
     * @param ttl
     * @returns {Promise<object>}
     */
    this.xSend = function (type, data, ttl){
        return new Promise(function (resolve, reject){
            $this.sendReadyResponse(type, data, ttl).then(function (data){
                if(typeof data['error'] === 'string'){
                    return reject(new Error(data['error']));
                }
                resolve(data);
            }).catch(function(e){
                reject(e);
            });
        });
    }

    /**
     *
     * @param xSocketData
     * @param ttl
     * @returns {Promise<{}>}
     */
    this.transportSocketData = function (xSocketData, ttl){
        return new Promise(function(resolve, reject) {
            $this.sendReadyResponse(xSocketData.getType(), xSocketData.getData(), ttl).then(function(data){
                resolve(data);
                xSocketData.resSuccess(data);
            }).catch(function (e) {
                reject(e);
                xSocketData.resError(e.message || '');
            });
        });
    };

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
