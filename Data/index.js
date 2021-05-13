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
     * @param data
     * @returns {Promise|*}
     */
    this.resSuccess = function (data){
        if(typeof data === 'object' && data.error){
            delete data.error;
        }
        return this.response(data);
    };

    /**
     *
     * @param msg
     * @returns {Promise|*}
     */
    this.resError = function (msg){
        return this.response({'error' : String(msg || 'unknown')});
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
