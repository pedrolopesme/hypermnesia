var hypermnesia = require("../lib/hypermnesia");

describe("Hypermnesia", function(){

    var cache = null;

    beforeEach(function(){
        cache = null;
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
        cache = new hypermnesia(function(key){
            return Math.floor((Math.random() * 100000) + 1);
        });

        var itemValue = cache.get(1);
        expect(cache.get(1)).toBe(itemValue);
    });

    it("Should return null if a item cannot be found", function(){
        cache = new hypermnesia(function(key){
            return undefined;
        });
        expect(cache.get(1)).toBe(null);
    });

}); 