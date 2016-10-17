<h1 align="center">
  <br>
  <img src="https://s3.amazonaws.com/github-pedrolopesme/hypermnesia.png" alt="Hypermnesia" width="200">
  <br>
  Hypermnesia
  <br>
  <br>
</h1>

<h4 align="center">A fast and lightweight NodeJS cache tool.</h4>

<p align="center">
  <a href="https://travis-ci.org/pedrolopesme/hypermnesia"><img src="https://api.travis-ci.org/pedrolopesme/hypermnesia.png?branch=master" alt="Travis Builds"></a>
</p>
<br>

### Features

**Hypermnesia** is a local cache (to a single run of your application) that performs high speed 
operations over your cached data.

Caches are tremendously useful in a wide variety of use cases. For example, 
you should consider using caches when a value is expensive to compute or retrieve, 
and you will need its value on a certain input more than once.

Generally, the Hypermnesia caching utilities are applicable whenever:

* You are willing to spend some memory/network to improve speed.
* You expect that keys will sometimes get queried more than once.
* Your cache will not need to store more data than what would fit in RAM. 
* Your cache data would expire after a certain amount of time

**Hypermnesia doesn't depend on any JS framework such as jQuery or similars.**

### Basic Usage and Options

All you need to do is provide a cache loader function whenever you need to use Hypermnesia. 

```javascript
var myCache = new Hypermnesia(function(key){
  // Some fetcher function that returns a unique value
  // to the given key 
});

// Getting items
var item1 = myCache.get(1);
var item2 = myCache.get("Peter");
var item3 = myCache.get("0fab3");
```

By default, **Hypermnesia** caching system doesn't drop out any data unless it's explicity 
needed (by calling one of the remove methods). But you can set the following options to 
change that behaviour:

* limit 

Max cached items limit. After reaching the limit, Hypermnesia starts to
dropping out the less accessed items. Zero means infinite (Default value is 0).

```javascript
var myCache = new Hypermnesia(function(key){
  // Some fetcher function that returns a unique value
  // to the given key 
}, {
    "limit" : 1000
});
```

* expire

Time expiration setting, in milliseconds. Once specified,
elements older than this setting will be automatically
refreshed and then, returned. Zero means no expiration 
(Default value is 0.)

```javascript
var myCache = new Hypermnesia(function(key){
  // Some fetcher function that returns a unique value
  // to the given key 
}, {
    "expiration" : 5000 // In milliseconds means 5 seconds.
});
```

### Operations

Hypermnesia supports the following operations:

#### Get

Returns an item from cache or, if the key wasn't found,
tries to fetch that item, cache it and return.

If the limit option was configured it automatically drops the less 
accessed items before cache new ones.  

Also, If the element is already cached and the 
expiration option was supplied when Hypermnesia was instantiated, it performs 
a time comparison before returning the item in order to check if its 
necessary to refresh it.

*Ex 1 - with default options*
```javascript
var myCache = new Hypermnesia(function(key){
  // Some fetcher function that returns a unique value
  // to the given key  
});

// The item with key 1 wasn't stored in the cache, so it will
// call the fetcher function passed when Hypermnesia 
// was instantiated.   
var item1 = cache.get(1); 

// Now item with key 1 is already stored in Hypermnesia internal
// cache, just return it.
item1 = cache.get(1); 
```

*Ex 2 - with time expiration*
```javascript
var myCache = new Hypermnesia(function(key){
  // Some fetcher function that returns a unique value
  // to the given key 
}, {
    "expiration" : 5000 // In milliseconds means 5 seconds.
});

// The item with key 1 wasn't stored in thecache, so it will
// call the fetcher function passed when Hypermnesia 
// was instantiated.   
var item1 = cache.get(1); 

// Now item with key 1 is already stored in Hypermnesia's internal
// cache, just return it.
item1 = cache.get(1); 

// 5 seconds after...

// Item with key 1 has expired, so Hypermnesia calls fetcher function
// again and cache it.
item1 = cache.get(1); 
```

*Ex 3 - with limit*
```javascript
var myCache = new Hypermnesia(function(key){
  // Some fetcher function that returns a unique value
  // to the given key 
}, {
  "limit" : 3 // Just 3 items will be cached
});

var item1 = cache.get(1); 
var item2 = cache.get(2); 
var item3 = cache.get(3); 

// Outputs 3 items
console.log(cache.getTotal());

var item4 = cache.get(4); 

// Outputs 3 items, item1 was dropped.
console.log(cache.getTotal());
```

#### Remove

Removes an item from the cache by its key. Invalid
keys are simply ignored.

Ex:
```javascript
var myCache = new Hypermnesia(function(key){
 // Some fetcher function that returns a unique value
 // to the given key
});

var item1 = cache.get(1);
var item2 = cache.get(2);
console.log(cache.getTotal()); // Outputs: 2

cache.remove(2);
console.log(cache.getTotal()); // Outputs: 1

cache.remove(1);
console.log(cache.getTotal()); // Outputs: 0
```

#### Remove all

Removes all items from the cache, recreating it from the scratch.
 
Ex:
```javascript
var myCache = new Hypermnesia(function(key){
    // Some fetcher function that returns a unique value
    // to the given key
});

var item1 = cache.get(1);
var item2 = cache.get(2);
console.log(cache.getTotal()); // Outputs: 2

cache.removeAll();
console.log(cache.getTotal()); // Outputs: 0
```

#### Refresh

Refreshes an item by its key removing it from cache 
and calling the get function.

Ex:
```javascript
var myCache = new Hypermnesia(function(key){
 // Some fetcher function that returns a unique value
 // to the given key
});

var item1 = cache.get(1);    // get a first version of item1
item1 = cache.refresh(1);    // now item1 is updated!
item1 = cache.get(1);        // get the updated version item1 again.
```

#### Get Total

Count all items already stored in the internal cache. It doesn't exclude
expired items from the total.

Ex:
```javascript
var myCache = new Hypermnesia(function(key){
 // Some fetcher function that returns a unique value
 // to the given key
});

var item1 = cache.get(1);
var item2 = cache.get(2);
console.log(cache.getTotal()); // Outputs: 2

cache.add(3, 'three');
console.log(cache.getTotal()); // Outputs: 3

cache.remove(3);
console.log(cache.getTotal()); // Outputs: 2

cache.removeAll();
console.log(cache.getTotal()); // Outputs: 0
```

#### Add

Allows add an item directly to the cache system. It is useful when there 
is a possibility to cache items in batches without use the fetcher 
function. Add the same item multiple times means update that item.

Ex:
```javascript
var myCache = new Hypermnesia(function(key){
 // Some fetcher function that returns a unique value
 // to the given key
});

// You can add a single element directly to the internal cache.
myCache.add(id, item);

// Or mix with an async response. Please take note that Hypermnesia 
// doesn't depend on jQuery to run. It's just an example.
$.get('https://myapi.com', function(results){
 $.each(results, function(item){
     myCache.add(item.id, item);
 });  
});
```


### Installing module

You can install it via npm. Just run:

`$ npm install hypermnesia`

Or you can get a compressed version on dist/hypermnesia.min.js and use it 
directly in your web app, like this:

```html
<script src="hypermnesia.min.js"></script>
```

### Installing module depencies

Just run:

`$ npm install hypermnesia`

### Compressing source

Just run:

`$ make compress`

### Running tests

Tests were write using [Jasmine](http://jasmine.github.io/). In order to run them, just type:

`$ npm test` 

### Modules

These are the main modules that make up Hypermnesia:

| module | tests | version | description |
|---|---|---|---|
| **[hypermnesia][hypermnesia]** |  [![][hypermnesia-timg]][hypermnesia-turl] | [![][hypermnesia-nimg]][hypermnesia-nurl]  | **cache lib (this module)**
| **[jsplay][jsplay]** |  [![][jsplay-timg]][jsplay-turl] | [![][jsplay-nimg]][jsplay-nurl]  | Splay Tree NodeJS module

[hypermnesia]: https://github.com/pedrolopesme/hypermnesia
[hypermnesia-timg]: https://api.travis-ci.org/pedrolopesme/hypermnesia.png?branch=master
[hypermnesia-turl]: https://travis-ci.org/pedrolopesme/hypermnesia
[hypermnesia-nimg]: https://img.shields.io/npm/v/hypermnesia.svg
[hypermnesia-nurl]: https://www.npmjs.com/package/hypermnesia

[jsplay]: https://github.com/pedrolopesme/jsplay
[jsplay-timg]: https://api.travis-ci.org/pedrolopesme/jsplay.png?branch=master
[jsplay-turl]: https://travis-ci.org/pedrolopesme/jsplay
[jsplay-nimg]: https://img.shields.io/npm/v/JSplay.svg
[jsplay-nurl]: https://www.npmjs.com/package/JSplay



### Build and Running Docker Image

To build a docker image, you should just simply type: 

`$ docker build -t pedrolopesme/hypermnesia .` 

In order to run it, simply do: 

`$ docker run pedrolopesme/hypermnesia` 

### Credits

Hypermnesia logo was created by [Zlatko Najdenovski](http://pixelbazaar.com/), released under [Creative Commons Attribution 3.0 Unported (CC BY 3.0)](http://creativecommons.org/licenses/by/3.0/) license.

### License

MIT. Copyright (c) [Pedro Mendes](http://pedromendes.com.br). 
