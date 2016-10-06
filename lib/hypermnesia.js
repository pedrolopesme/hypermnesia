module.exports = function(itemFetcherFunc) {

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
     * Using JSplay tree to improve cache speed in basic operations 
     */
    var JSplay = require("JSplay");

    /**
     * In-memory cache storage
     */
    var cache = new JSplay();

    /**
     * Cache item definition
     */
    var CachedItem = function(key, value) {
        var key = key;
        var value = value;

        /**
         * Returns cached item key
         */
        this.getKey = function(){
            return key;
        }

        /**
         * Returns cached item value
         */
        this.getValue = function(){
            return value;
        }
    }

    /**
     * Fetches an item using itemFetcher function
     */
    var fetchAndCacheItem = function(key){
        var item = itemFetcher(key);
        if(item != null && item != undefined){
            var cItem = new CachedItem(key, item);
            cache.add(key, cItem);
            return item;
        }
        return null;
    }

    /**
     * Returns an item from cache or fetch it, cache and return.
     */
    this.get = function(key) {
        var cachedItem = cache.get(key);
        if(cachedItem != null){
             return cachedItem.getValue();
        } 
        return fetchAndCacheItem(key);
    }

    /**
     * Removes an item from cache
     */
    this.remove = function(key) {
        cache.remove(key);
    }

    /**
     * Removes all itens from cache
     */
    this.removeAll = function() {
        cache = new JSplay();
    }

    /**
     * Refreshes a item from cache and return it
     */
    this.refresh = function(key) {
        var item = cache.remove(key);
        if(item != undefined){
            return this.get(key);
        }
        return null;
    }
}