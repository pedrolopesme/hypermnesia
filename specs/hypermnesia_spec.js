var hypermnesia = require("../lib/hypermnesia");

describe("Hypermnesia", function(){

    var cache = null;
    var fetcherFunction = function(key){
        return Math.floor((Math.random() * 100000) + 1);
    }

    beforeEach(function(){
        cache = new hypermnesia(fetcherFunction);
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

    it("Should know how many items are cached", function(){
        var elementsTest = 1000;

        // Increasing items
        expect(cache.getTotal()).toBe(0);
        for(var i = 1; i <= elementsTest; i++){
            cache.get(i);
            expect(cache.getTotal()).toBe(i);
        }

        // Decreasing items
        for(var i = elementsTest; i >= 1; i--){
            expect(cache.getTotal()).toBe(i);
            cache.remove(i);
        }
        expect(cache.getTotal()).toBe(0);
    });

    it("Should allow use a max items limit and drop older itens whenever its necessary", function(){
        var options = {
            "limit" : 3
        };
        cache = new hypermnesia(fetcherFunction, options);
        
        cache.get(1);
        cache.get(2);
        cache.get(3);
        expect(cache.getTotal()).toBe(3);

        cache.get(4);
        expect(cache.getTotal()).toBe(3);
    });

    it("Should not drop elements from cache when updates the same item multiple times", function(){
        var options = {
            "limit" : 3
        };
        cache = new hypermnesia(fetcherFunction, options);
        
        cache.get(1);
        cache.get(2);
        var item3Value = cache.get(3);
        expect(cache.getTotal()).toBe(3);

        cache.refresh(3);
        cache.refresh(3);
        cache.refresh(3);
        var item3UpdatedValue = cache.get(3);
        expect(item3Value).not.toBe(item3UpdatedValue);
        expect(cache.getTotal()).toBe(3);
    });

    describe("expiration system", function(){

        var itemBeforeExpiration;
        var itemAfterExpiration;

        beforeEach(function(done) {
            var options = {
                "expiration" : 50
            };
            cache = new hypermnesia(fetcherFunction, options);

            itemBeforeExpiration = cache.get(1);
            setTimeout(function() {
                itemAfterExpiration = cache.get(1);
                done();
            }, 100);
        });

        it("Should expire elements when times up.", function(){
            expect(itemBeforeExpiration).not.toBe(itemAfterExpiration);
        });
    }); 

    describe("expiration system", function(){

        var itemBeforeExpiration;
        var itemAfterExpiration;

        beforeEach(function(done) {
            var options = {
                "expiration" : 300
            };
            cache = new hypermnesia(fetcherFunction, options);

            itemBeforeExpiration = cache.get(1);
            setTimeout(function() {
                itemAfterExpiration = cache.get(1);
                done();
            }, 100);
        });

        it("Should not expire elements before times up.", function(){
            expect(itemBeforeExpiration).toBe(itemAfterExpiration);
        });
    }); 


}); 