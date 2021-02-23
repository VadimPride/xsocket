const events = require('events');
const ws     = require('ws');
const https  = require('https');
const fs     = require('fs');
const uuid    = require('uuid');

xSocket.Server = class xSocketServer extends events
{

    constructor(settings) {
        super();
        this.__settings = Object.assign({}, settings || {});
        this.__http = undefined;
        this.__ws   = undefined;
        this.__isListen = undefined;
        this.__useCallback = {};
        this.__socketObjectList = {};


        const $this = this;
        let options = $this.getSettingsVal('https', {});
        if(typeof options['cert'] === 'string'){
            options['cert'] = fs.readFileSync(options['cert']);
        }
        if(typeof options['key'] === 'string'){
            options['key'] = fs.readFileSync(options['key']);
        }
        this.__http = https.createServer(options, (req, res) => {
            $this.emit('https', req, res);
            setTimeout(() => {
                try{
                    res.writeHead(404);
                    res.end();
                }catch (e){}
            }, 5000);
        });
        this.__ws = new ws.Server({ 'server' : this.__http});
        this.__ws.on('connection', (wsClient, req) => {
            wsClient.isConnection = () => {
                return wsClient.readyState === 1;
            };
            wsClient.closeConnection = function (msg){
                try{
                    wsClient.close(1000, String(msg || 'close'));
                }catch (e){}
            };
            wsClient.sendObject = (object) => {
                try {
                    if(wsClient.isConnection()){
                        wsClient.send(JSON.stringify(object));
                        return true;
                    }
                }catch (e){}
                return false;
            };
            wsClient.query = ((str) => {
                let queryString = typeof str === 'string' ? str.replace(/.*?\?/,"") : '';
                let query      = {};
                if (!queryString.length) return query;
                let split = queryString.split('&');
                for (let i in split)
                {
                    let key = split[i].split('=')[0];
                    if (!key.length) continue;
                    let val = split[i].split('=')[1] || undefined;
                    let valArr = typeof val === 'string' ? val.split('#') : [].push(val);
                    query[key] = valArr[0];
                    if(valArr[1]){
                        query['_hashTag_'] = valArr[1];
                    }
                }
                return query;
            })(req.url || '');
            let SocketObject;
            wsClient.query['xSOId']   = String(wsClient.query['xSOId'] || '');
            wsClient.query['xSOSign'] = String(wsClient.query['xSOSign'] || '');
            if(wsClient.query['xSOId'].length && wsClient.query['xSOSign'].length){
                let s = $this.getSocketObject(wsClient.query['xSOId']);
                if(s && s.getSign() === wsClient.query['xSOSign']){
                    if(s.update(wsClient)){
                        wsClient.sendObject(['SO|update', {
                            'xSOId': s.getID(),
                            'xSOSign' : s.getSign()
                        }]);
                        SocketObject = s;
                    }
                }
            }
            if(!SocketObject){
                wsClient.query['xSOId'] = uuid.v4();
                wsClient.query['xSOSign'] = uuid.v4();
                SocketObject = new xSocket.xSocketObject(true, req);
                if(SocketObject.update(wsClient)){
                    wsClient.sendObject(['SO|update', {
                        'xSOId': SocketObject.getID(),
                        'xSOSign' : SocketObject.getSign()
                    }]);
                    $this.__socketObjectList[SocketObject.getID()] = SocketObject;
                    if($this.getSettingsVal('auth', false)){
                        $this.useEmit('auth', SocketObject).then(() => {
                            $this.emit('connect', SocketObject);
                        }).catch((e) => {
                            SocketObject.destroy('auth|'+(e.message || 'denied'));
                        });
                    }else{
                        $this.emit('connect', SocketObject);
                    }
                    let SocketObjectTimeout = parseInt($this.getSettingsVal('socketObjectTimeout', 0));
                    if(SocketObjectTimeout !== SocketObjectTimeout || SocketObjectTimeout < 0){
                        SocketObjectTimeout = 0;
                        console.warn('[warn|xSocket]', 'socketObjectTimeout invalid value,', 'set default is 0');
                    }
                    let soTimeout = undefined;
                    SocketObject.on('disconnect', (SocketObject) => {
                        soTimeout = setTimeout((SocketObject) => {
                            SocketObject.destroy('socketObjectTimeout');
                        }, SocketObjectTimeout, SocketObject);
                        SocketObject.once('connect', () => {
                            if(soTimeout){
                                try{
                                    clearTimeout(soTimeout);
                                    soTimeout = undefined;
                                }catch (e){}
                            }
                        });
                    });
                    SocketObject.once('destroy', (SocketObject) => {
                        wsClient.closeConnection(SocketObject.getDestroy() || 'destroy');
                        delete $this.__socketObjectList[SocketObject.getID()];
                        if(soTimeout){
                            try{
                                clearTimeout(soTimeout);
                                soTimeout = undefined;
                            }catch (e){}
                        }
                    });
                }else{
                    wsClient.closeConnection('update');
                }
            }
            let msgInc = 0;
            var pingTimeout = setInterval(function (){
                if(!msgInc){
                    wsClient.closeConnection('pingTimeout');
                }
                msgInc = 0;
            }, 15000);
            wsClient.onmessage = (e) => {
                msgInc++;
                let msg = String(e.data || '');
                if(msg === 'ping'){
                    return wsClient.sendMessage('pong');
                }
                if(SocketObject){
                    try{
                        let body = JSON.parse(msg);
                        if( typeof body === 'object' && typeof body[0] === 'string' && typeof body[1] === 'object'){
                            SocketObject.emit('ws|message', body[0], body[1]);
                        }
                    }catch (e){}
                }
            };
            wsClient.onclose = (e) => {
                try{clearInterval(pingTimeout); }catch (e){}
                let msg = e.reason || 'close';
                if(SocketObject){
                    SocketObject.emit('ws|disconnect', msg);
                }
                $this.emit('ws|disconnect', msg);

            };
            $this.emit('ws|connect', wsClient);
        });
    }

    /**
     *
     * @returns {{}}
     */
    getSocketObjectList(){
        return this.__socketObjectList || {};
    }

    /**
     *
     * @param ID
     * @returns {*|boolean}
     */
    getSocketObject(ID){
        return this.getSocketObjectList()[ID] || false;
    }

    /**
     *
     * @returns {number}
     */
    getPort(){
        return this.getSettings()['port'] || 443;
    }

    /**
     *
     * @returns {{}}
     */
    getSettings(){
        return this.__settings || {};
    }

    /**
     *
     * @param key
     * @param def
     * @returns {*}
     */
    getSettingsVal(key, def){
        return this.getSettings()[key] || def;
    }

    /**
     *
     * @param target
     * @param data
     * @returns {Promise}
     */
    useEmit(target, data){
      const $this = this;
      return new Promise((resolve, reject) => {
          const callback = typeof $this.__useCallback[target] == 'function' ? $this.__useCallback[target] : false;
          const successCallback = () => {
              resolve();
          };
          const failedCallback = (message) => {
              reject(new Error(typeof message === 'string' ? message : ''));
          };
          if(!callback){
              return failedCallback('');
          }

          callback.call($this, data, successCallback, failedCallback);
      });
    }

    /**
     *
     * @param target
     * @param callback
     * @returns {xSocket.xSocketServer}
     */
    use(target, callback){
        if(typeof target !== 'string' || target.length < 1){
            throw new Error('Invalid target value!');
        }
        if(typeof callback !== 'function'){
            throw new Error('Invalid callback!');
        }
        this.__useCallback[target] = callback;
        this.emit('use|append', target, callback);
        return this;
    }

    /**
     *
     * @returns {Promise}
     */
    listen(){
        const $this = this;
        return new Promise((resolve, reject) => {
            if($this.__isListen){
                return reject(new Error('repeat'))
            }
            if($this.__isListen === null){
                $this.once('listen', () => {
                   resolve();
                });
                $this.once('error', (e) => {
                    reject(e);
                });
                return;
            }
            $this.__isListen = null;
            try{
                $this.__http.listen($this.getPort(), () => {
                    $this.__isListen = true;
                    $this.emit('listen');
                    resolve();
                });
            }catch (e){
                $this.emit('error', e);
                reject(e);
            }

        });
    }

}