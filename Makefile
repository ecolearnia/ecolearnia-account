test:
	@./node_modules/.bin/mocha -u tdd  --recursive --reporter spec test/spec --timeout 40000

test-debug:
	@./node_modules/.bin/mocha test/spec/providers/accountmanager_mysql.tests.js --debug-brk

.PHONY: test
