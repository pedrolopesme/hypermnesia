module.exports = function(itemFetcherFunc, passedOptions) {

    /**
     * Default options
     */
    var defaults = {
        // Max items limit. Zero means infinite.
        limit : 0
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
     * Merging default options with given options passed on construtor
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
     * Using JSplay tree to improve cache speed on basic operations 
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
     * Checks if the current cache has available storage for more itens
     */
    var hasFreeSpace = function(){
        return (options.limit == 0 || cache.getSize() < options.limit);
    }

    /**
     * Fetches an item using itemFetcher function
     */
    var fetchAndCacheItem = function(key){
        var item = itemFetcher(key);
        if(item != null && item != undefined){
            return storeCachedItem(key, item);
        }
        return null;
    }

    /**
     * Store a cachedItem into cache
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
     * Removes the oldest item form cache 
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
     * Returns an item from cache or fetch it, cache and return.
     */
    this.get = function(key) {
        var cachedItem = cache.get(key) || fetchAndCacheItem(key);
        if(cachedItem != null){
             return cachedItem.getValue();
        } 
        return null;
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

    /**
     * Return total itens cached
     */
    this.getTotal = function(){
        return cache.getSize();
    }
}