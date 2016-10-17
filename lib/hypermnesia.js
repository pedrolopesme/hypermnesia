module.exports = function(itemFetcherFunc, passedOptions) {

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
     * Default options
     */
    var defaults = {

        // Max cached items limit. Zero means infinite.
        "limit" : 0,

        // Time expiration setting, in milliseconds. Once specified,
        // elements older than this setting will be automatically
        // refreshed and then, returned. Zero means no expiration.
        "expiration" : 0
    };

    /**
     * Private procedure that merges default options with the given 
     * options passed to the constructor, preserving constructor's options over 
     * the default ones.
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
     * Recently queried items are fetched faster than older ones. 
     * More info on https://github.com/pedrolopesme/jsplay. 
     */
    var JSplay = require("JSplay");
    var cache = new JSplay();

    /**
     * Private function that defines an item to be cached.
     * 
     * In order to instantiate it, you'll need to provide item's key and value.
     * You can cache whatever you want (integers, strings, jsons, etc), but
     * you'll have better a performance operating over the cached items
     * where you're using an integer as item's key.  
     * 
     * Ex:
     * var item1 = new CachedItem(1, "one");
     * var item2 = new CachedItem(2, 2);
     * var item3 = new CachedItem(3, { "val" : "three" });
     * 
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
     * Get from Cache
     * 
     * Private function that gets an item from the cache by it's key. 
     * Before return the item, it automatically checks if the item
     * needs to be refreshed.
     * 
     * Ex:
     * var item = getFromCache(1); 
     * 
     */
    var getFromCache = function(key){
        var item = cache.get(key);
        if(item != null){
            return autoRefresh(item);
        }
        return null;
    }

    /**
     * Fetch and Cache Item
     * 
     * Private function that calls on the fetcher function passing a key
     * and, if there was a valid return (i.e. not null), triggers the 
     * function that caches an item. 
     * 
     * Ex:
     * var cachedItem = getFromCache(1); 
     * 
     */
    var fetchAndCacheItem = function(key){
        var item = itemFetcher(key);
        if(item != null){
            return storeCachedItem(key, item);
        }
        return null;
    }

    /**
     * Has Free Space
     * 
     * Private boolean function that checks if the current cache has available 
     * storage for more items.
     * 
     * If the limit option is defined as zero it ignores any further validations. 
     * Otherwise, it compares the total items cached to the limit. True means
     * that there are available space to store more items.
     * 
     * Ex:
     * hasFreeSpace(); // Returns true of false according to cache state.
     * 
     */
    var hasFreeSpace = function(){
        return (options.limit == 0 || cache.getSize() < 1 || cache.getSize() < options.limit);
    }

    /**
     * Store Cached Item
     * 
     * Private function that put an item into the cache if there 
     * are available space for it. Otherwise, it tries to release the needed 
     * space before and then, put an item into the cache.
     * 
     * Ex:
     * var cacheItem = storeCachedItem(1, "first item");
     * 
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
     * Free Space
     * 
     * Private function that makes room for new items by removing the least 
     * accessed ones from the cache until all the needed space exists.
     * 
     * Ex:
     * freeSpace();
     * 
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
     * Calculate Item Age
     * 
     * Private function that calculates item age.
     * 
     * All cached items have an internal field containing its date of creation. 
     * This function used it comparing the difference between now and 
     * item's creation, in milliseconds.
     * 
     * Ex:
     * // an item create in 2016-10-22 00:00:00
     * var item = new CachedItem(1, "one");
     * 
     * // Now is 2016-10-22 00:30:00
     * calculateItemAge(item); // returns 1.800.000ms between item creation and now.
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
     * Auto Refresh
     * 
     * Private function that refreshes an item if that became 
     * older enough and update that cache with it.
     * 
     * Ex:
     * var item = autoRefresh(item);
     * 
     */
    var autoRefresh = function(item) {
        if(needsRefresh(item)){
            var itemValue = itemFetcher(item.getKey());
            item = new CachedItem(key, itemValue);
            cache.add(item.getKey(), item); 
        }
        return item;
    }

    /**
     * Needs Refresh
     * 
     * Private boolean function that checks is an item needs to be refreshed. 
     * 
     * Ex:
     * needsRefresh(item); // Returns true or false
     * 
     */
    var needsRefresh = function(item) {
        return (item != null && options.expiration > 0 && calculateItemAge(item) >= options.expiration);
    }

    /**
     * Get.
     * 
     * Returns an item from cache or, if the key wasn't found,
     * tries to fetch that item, cache it and return.
     * 
     * If the limit option was configured it automatically drops less 
     * accessed items before cache new ones.  
     * 
     * Also, If the element is already cached and the 
     * expiration option was supplied when Hypermnesia was instantiated, it performs 
     * a time comparison before returning the item in order to check if its 
     * necessary to refresh it.
     * 
     * Ex 1 - with default options
     * ---------------------------
     * var myCache = new Hypermnesia(function(key){
     *      // Some fetcher function  
     * });
     * 
     * // The item with key 1 wasn't stored in the cache, so it will
     * // call the fetcher function passed when Hypermnesia 
     * // was instantiated.   
     * var item1 = cache.get(1); 
     * 
     * // Now item with key 1 is already stored in Hypermnesia internal
     * // cache, just return it.
     * item1 = cache.get(1); 
     * 
     * 
     * Ex 2 - with time expiration
     * ---------------------------
     * var myCache = new Hypermnesia(function(key){
     *    // Some fetcher function  
     * }, {
     *    "expiration" : 5000 // In milliseconds means 5 seconds.
     * });
     * 
     * // The item with key 1 wasn't stored in thecache, so it will
     * // call the fetcher function passed when Hypermnesia 
     * // was instantiated.   
     * var item1 = cache.get(1); 
     * 
     * // Now item with key 1 is already stored in Hypermnesia's internal
     * // cache, just return it.
     * item1 = cache.get(1); 
     * 
     * // 5 seconds after...
     * 
     * // Item with key 1 has expired, so Hypermnesia calls fetcher function
     * // again and cache it.
     * item1 = cache.get(1); 
     * 
     * Ex 3 - with limit
     * -----------------
     * var myCache = new Hypermnesia(function(key){
     *    // Some fetcher function  
     * }, {
     *    "limit" : 3 // Just 3 items will be cached
     * });
     * 
     * var item1 = cache.get(1); 
     * var item2 = cache.get(2); 
     * var item3 = cache.get(3); 
     * 
     * // Outputs 3 items
     * console.log(cache.getTotal());
     * 
     * var item4 = cache.get(4); 
     * 
     * // Outputs 3 items, item1 was dropped.
     * console.log(cache.getTotal());
     * 
     */
    this.get = function(key) {
        var cachedItem = getFromCache(key) || fetchAndCacheItem(key);
        if(cachedItem != null){
             return cachedItem.getValue();
        } 
        return null;
    }

    /**
     * Remove.
     * 
     * Removes an item from the cache by its key. Invalid
     * keys are simply ignored.
     * 
     * Ex:
     * var myCache = new Hypermnesia(function(key){
     *      // Some fetcher function that returns a unique value
     *      // to the given key
     * });
     * 
     * var item1 = cache.get(1);
     * var item2 = cache.get(2);
     * console.log(cache.getTotal()); // Outputs: 2
     * 
     * cache.remove(2);
     * console.log(cache.getTotal()); // Outputs: 1
     * 
     * cache.remove(1);
     * console.log(cache.getTotal()); // Outputs: 0
     * 
     */
    this.remove = function(key) {
        cache.remove(key);
    }

    /**
     * Remove all
     * 
     * Removes all items from the cache, recreating it from the scratch.
     * 
     * Ex:
     * var myCache = new Hypermnesia(function(key){
     *      // Some fetcher function that returns a unique value
     *      // to the given key
     * });
     * 
     * var item1 = cache.get(1);
     * var item2 = cache.get(2);
     * console.log(cache.getTotal()); // Outputs: 2
     * 
     * cache.removeAll();
     * console.log(cache.getTotal()); // Outputs: 0
     * 
     */
    this.removeAll = function() {
        cache = new JSplay();
    }

    /**
     * Refresh.
     * 
     * Refreshes an item by its key removing it from cache 
     * and calling the get function.
     * 
     * Ex:
     * var myCache = new Hypermnesia(function(key){
     *      // Some fetcher function that returns a unique value
     *      // to the given key
     * });
     *  
     * var item1 = cache.get(1);    // get a first version of item1
     * item1 = cache.refresh(1);    // now item1 is updated!
     * item1 = cache.get(1);        // get the updated version item1 again.
     * 
     */
    this.refresh = function(key) {
        var item = cache.remove(key);
        if(item != null){
            return this.get(key);
        }
        return null;
    }

    /**
     * Get Total
     * 
     * Count all items already stored in the internal cache. It doesn't exclude
     * expired items from the total.
     * 
     * Ex:
     * var myCache = new Hypermnesia(function(key){
     *      // Some fetcher function that returns a unique value
     *      // to the given key
     * });
     *  
     * var item1 = cache.get(1);
     * var item2 = cache.get(2);
     * console.log(cache.getTotal()); // Outputs: 2
     * 
     * cache.add(3, 'three');
     * console.log(cache.getTotal()); // Outputs: 3
     * 
     * cache.remove(3);
     * console.log(cache.getTotal()); // Outputs: 2
     * 
     * cache.removeAll();
     * console.log(cache.getTotal()); // Outputs: 0
     */
    this.getTotal = function(){
        return cache.getSize();
    }

    /**
     * Add.
     * 
     * Allows add an item directly to the cache system. It is useful when there 
     * is a possibility to cache items in batches without use the fetcher 
     * function. Add the same item multiple times means update that item.
     * 
     * Ex:
     * var myCache = new Hypermnesia(function(key){
     *      // Some fetcher function that returns a unique value
     *      // to the given key
     * });
     * 
     * // You can add a single element directly to the internal cache.
     * myCache.add(id, item);
     * 
     * // Or mix with an async response. Please take note that Hypermnesia 
     * // doesn't depend on jQuery to run. It's just an example.
     * $.get('https://myapi.com', function(results){
     *      $.each(results, function(item){
     *          myCache.add(item.id, item);
     *      });  
     * });
     */
    this.add = function(key, item){
        var cacheItem = new CachedItem(key, item);
        cache.add(key, cacheItem);
    }
}