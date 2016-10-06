var hypermnesia = require("../lib/hypermnesia");

describe("Hypermnesia", function(){

    var cache = null;

    beforeEach(function(){
        cache = new hypermnesia(function(key){
            return Math.floor((Math.random() * 100000) + 1);
        });
    });

    it("Must receive a function in it's creation", function(){
        expect(function(){ new hypermnesia() }).toThrow();
    });

    it("Should uses a given function in order to fetch fresh items and cache them", function(){
        cache = new hypermnesia(function(key){
            return key;
        });
        expect(cache.get(1)).toBe(1);
    });

    it("Should return item from cache it was cached", function(){
        var itemValue = cache.get(1);
        expect(cache.get(1)).toBe(itemValue);
    });

    it("Should return null if a item cannot be found", function(){
        cache = new hypermnesia(function(key){
            return undefined;
        });
        expect(cache.get(1)).toBe(null);
    });

    it("Should allow remove a item by its key from cache", function(){
        var item1 = cache.get(1);
        expect(cache.get(1)).toBe(item1);

        cache.remove(1);
        expect(cache.get(1)).not.toBe(item1);
    });

    it("Should behave properly when trying to remove from cache a non-existent element", function(){
        cache.remove(1);
    });

    it("Should allow remove all elements from cache", function(){
        var item1 = cache.get(1);
        var item2 = cache.get(2);
        var item3 = cache.get(3);

        expect(cache.get(1)).toBe(item1);
        expect(cache.get(2)).toBe(item2);
        expect(cache.get(3)).toBe(item3);

        cache.removeAll();

        expect(cache.get(1)).not.toBe(item1);
        expect(cache.get(2)).not.toBe(item2);
        expect(cache.get(3)).not.toBe(item3);
    });

    it("Should refresh an item", function(){
        var item1 = cache.get(1);
        expect(cache.get(1)).toBe(item1);

        var item1Refreshed = cache.refresh(1);
        expect(item1).not.toBe(item1Refreshed);
    });

    it("Should return null when tried to refresh an inexistent item", function(){
        expect(cache.refresh(1)).toBe(null);
    });

}); 