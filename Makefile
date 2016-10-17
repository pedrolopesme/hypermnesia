test:
	./node_modules/jasmine-node/bin/jasmine-node --verbose specs/*
compress:
	./node_modules/uglify-js/bin/uglifyjs lib/hypermnesia.js -nc > dist/hypermnesia.min.js 
