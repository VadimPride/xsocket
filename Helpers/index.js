xSocket.helpers = new function helpersObject (){

    /**
     *
     * @returns {Window|*}
     */
    this.getWindow = function (){
        return xSocket.window;
    };

    /**
     *
     * @returns {any}
     */
    this.getProcess = function (){
        return xSocket.process;
    };

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
                    if(i.indexOf(__prefix_once) >= 0 && typeof __listerens[name][i] === 'function'){
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
