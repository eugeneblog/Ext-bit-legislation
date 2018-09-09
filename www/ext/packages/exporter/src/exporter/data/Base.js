/**
 * Base class for data object.
 */
Ext.define('Ext.exporter.data.Base', {
    requires: [
        'Ext.util.Collection'
    ],

    config: {
        /**
         * @cfg {String} idPrefix
         *
         * Prefix to use when generating the id.
         *
         * @private
         */
        idPrefix: 'id',
        /**
         * @cfg {String} id
         *
         * Unique id for this object. Auto generated when missing.
         */
        id: null,
        /**
         * @cfg {Boolean} autoGenerateId
         *
         * Set to `true` to auto generate an id if none is defined.
         */
        autoGenerateId: true,
        /**
         * @cfg {String[]} autoGenerateKey
         *
         * Set an array of config names available on this class that will
         * be used to generate a key. This key is useful when instances
         * of this class are used in a {@link Ext.util.Collection}.
         *
         * The key is generated by combining the values of those configs.
         * If a config value is an instance of a class then it will look
         * for a getKey function on that class and use it.
         *
         * Set to false if you don't want to generate they key
         */
        autoGenerateKey: {
            $value: false,
            merge: function (newValue, oldValue) {
                return newValue ? Ext.concat(newValue, oldValue || null) : false;
            }
        }
    },

    // keep references to internal collections to easily destroy them
    internalCols: null,
    clearPropertiesOnDestroy: false,

    constructor: function(config){
        var me = this;

        me.internalCols = [];
        me.initConfig(config);

        if(!me._id){
            me.setId(null);
        }
        return me.callParent([config]);
    },

    destroy: function(){
        this.destroyCollections();
        this.callParent();
        this.internalCols = null;
    },

    destroyCollections: function(){
        var cols = this.internalCols,
            len = cols.length,
            i, j, length, col;

        for(i = 0; i < len; i++){
            col = cols[i];
            length = col.length;
            for(j = 0; j < length; j++) {
                col.items[j].destroy();
            }
            col.destroy();
        }
        cols.length = 0;
    },

    clearCollections: function(cols){
        var i, len, col;

        cols = cols ? Ext.Array.from(cols) : this.internalCols;
        len = cols.length;

        for(i = len - 1; i >= 0; i--){
            col = cols[i];
            if(col) {
                col.destroy();
            }
            Ext.Array.remove(this.internalCols, col);
        }
    },

    applyId: function(data){
        var id;

        if(!data && this._autoGenerateId){
            id = this._idPrefix + (++Ext.idSeed);
        }else{
            id = data;
        }

        return id;
    },

    /**
     * This method could be used in config appliers that need to initialize a
     * Collection that has items of type className.
     *
     * @param data
     * @param dataCollection
     * @param className
     * @return {Ext.util.Collection}
     */
    checkCollection: function(data, dataCollection, className){
        var col;

        if(data){
            col = this.constructCollection(className);
            col.add(data);
        }

        if(dataCollection){
            Ext.Array.remove(this.internalCols, dataCollection);
            Ext.destroy(dataCollection.items, dataCollection);
        }

        return col;
    },

    /**
     * Create a new Collection with a decoder for the specified className.
     *
     * @param className
     * @returns {Ext.util.Collection}
     *
     * @private
     */
    constructCollection: function(className){
        var cls = Ext.ClassManager.get(className),
            cfg = {
                decoder: this.getCollectionDecoder(cls)
            },
            col;

        if(typeof cls.prototype.getKey === 'function'){
            cfg.keyFn = this.getCollectionItemKey;
        }

        col = new Ext.util.Collection(cfg);

        this.internalCols.push(col);
        return col;
    },

    /**
     * Builds a Collection decoder for the specified className.
     *
     * @param klass
     * @returns {Function}
     *
     * @private
     */
    getCollectionDecoder: function(klass){
        return function(config){
            return (config && config.isInstance) ? config : new klass(config || {});
        };
    },

    /**
     * Returns a collection item key
     *
     * @param item
     * @return {String}
     *
     * @private
     */
    getCollectionItemKey: function(item){
        return item.getKey ? item.getKey() : (item._id || item.getId());
    },

    getKey: function() {
        var generate = this.getAutoGenerateKey(),
            key = '',
            config = this.getConfig(),
            len, i;

        if(!Ext.isArray(generate) || !generate.length) {
            return this.getId();
        }

        len = generate.length;
        for(i = 0; i < len; i++) {
            key += this.serializeKeyValue(config[generate[i]]);
        }

        return key;
    },

    serializeKeyValue: function(value) {
        var key = '',
            keys, len, i;

        if (value === null) {
            key = '_';
        } else if (Ext.isDate(value)) {
            key = value.getTime();
        } else if (Ext.isArray(value)) {
            len = value.length;
            for (i = 0; i < len; i++) {
                key += this.serializeKeyValue(value[i]);
            }
        } else if (typeof value === 'object') {
            if (value.isInstance) {
                key = value.getKey ? value.getKey() : '_';
            } else {
                keys = Ext.Object.getAllKeys(value);
                keys = Ext.Array.sort(keys);
                len = keys.length;
                for (i = 0; i < len; i++) {
                    key += this.serializeKeyValue(value[keys[i]]);
                }
            }
        } else {
            key = value;
        }

        return key;
    }
});