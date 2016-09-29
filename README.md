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

### Installing module

Just run:

`$ npm install`

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