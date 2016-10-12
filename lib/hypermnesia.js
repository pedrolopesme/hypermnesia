module.exports = function(itemFetcherFunc, passedOptions) {

    /**
     * Default options
     */
    var defaults = {

        // Max items to be cached limit. Zero means infinite.
        "limit" : 0,

        // Time expiration setting, in milliseconds. Once expecified,
        // elements older than this setting will be automatically
        // refreshed and then, returned. Zero means no expiration.
        "expiration" : 0
    };

    /**
     * Hypermnesia should always be instantiated with a function
     * that will be called every time a key wasn't found in it's 
     * internal cache.
     */
    if(itemFetcherFunc == undefined || itemFetcherFunc == null){
        throw new Error("You must provide a function that will be called every \
        time a key wasn't found in my internal cache." );
    }

    var itemFetcher = itemFetcherFunc;

    /**
     * Merging default options with the given options passed on construtor
     */
    var options = {};
    for(var key in defaults){
        if(passedOptions != undefined && passedOptions.hasOwnProperty(key)) {
            options[key] = passedOptions[key];
        } else if(defaults.hasOwnProperty(key)) {
            options[key] = defaults[key];
        }
    }

    /**
     * In-memory cache storage
     * 
     * Using JSplay tree to improve cache speed on basic operations O(log n).
     * Recent queried items are fetched faster than older ones. 
     * More info on https://github.com/pedrolopesme/jsplay. 
     */
    var JSplay = require("JSplay");
    var cache = new JSplay();

    /**
     * Cache item definition
     */
    var CachedItem = function(key, value) {

        var key = key;
        var value = value;
        var createAt = new Date().getTime();

        /**
         * Returns item's key
         */
        this.getKey = function(){
            return key;
        }

        /**
         * Returns item's value
         */
        this.getValue = function(){
            return value;
        }

        /**
         * Returns item's creation date
         */
        this.getCreateDate = function(){
            return createAt;
        }
    }

   /**
     * Checks if the current cache has available storage for more itens
     */
    var hasFreeSpace = function(){
        return (options.limit == 0 || cache.getSize() < options.limit);
    }

    /**
     * Get an item from cache by it's key. Automatically triggers
     * refresh function it the item needs to be refreshed.
     */
    var getFromCache = function(key){
        var item = cache.get(key);
        if(item != null){
            return autoRefresh(item);
        }
        return null;
    }

    /**
     * Fetches an item using itemFetcher function
     */
    var fetchAndCacheItem = function(key){
        var item = itemFetcher(key);
        if(item != null){
            return storeCachedItem(key, item);
        }
        return null;
    }

    /**
     * Stores a fetched item into cache
     */
    var storeCachedItem = function(key, item){
        if(!hasFreeSpace()){
            freeSpace();
        }
        var cachedItem = new CachedItem(key, item);
        cache.add(cachedItem.getKey(), cachedItem);
        return cachedItem;
    }

    /**
     * Makes room for new items, removing the oldest ones from cache 
     */
    var freeSpace = function() {
        while(!hasFreeSpace()){
            cache.splayDeepest();
            if(cache.root != null){
                cache.remove(cache.root.key);
            } else {
                return;
            }
        }
    }

    /**
     * Calculates item age using time in milliseconds
     */
    var calculateItemAge = function(item){
        if(item != null){
            var now = new Date().getTime();
            var itemCreation = item.getCreateDate();
            return now - itemCreation;
        }
        return 0;
    }

    /**
     * Refreshes an item if it become older enougth and update
     * cache.
     */
    var autoRefresh = function(item) {
        if(item != null && item != undefined){
            if(options.expiration != 0 && calculateItemAge(item) >= options.expiration) {
                var itemValue = itemFetcher(item.getKey());
                item = new CachedItem(key, itemValue);
                cache.add(item.getKey(), item);
            } 
            return item;
        }
        return null;
    }

    /*
     * --------------
     * Public methods 
     * --------------
     */

    /**
     * Returns an item from cache or, if it wasn't found,
     * fetch it, cache and return.
     */
    this.get = function(key) {
        var cachedItem = getFromCache(key) || fetchAndCacheItem(key);
        if(cachedItem != null){
             return cachedItem.getValue();
        } 
        return null;
    }

    /**
     * Removes an item from cache by its key
     */
    this.remove = function(key) {
        cache.remove(key);
    }

    /**
     * Removes all items from cache
     */
    this.removeAll = function() {
        cache = new JSplay();
    }

    /**
     * Refreshes an item and return it
     */
    this.refresh = function(key) {
        var item = cache.remove(key);
        if(item != null){
            return this.get(key);
        }
        return null;
    }

    /**
     * Returns stored items total
     */
    this.getTotal = function(){
        return cache.getSize();
    }
}