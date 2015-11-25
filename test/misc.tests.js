"use strict";

class Test {
  constructor(val) {
    this.val = val;
    this.default = 'Default';
  }

  foo(data) {
    console.log('Test ' + this.val + data);
  }
}

class Test2 extends Test {
  constructor(val) {
    super(val);
  }

  foo(data) {
    console.log('Test2 ' + this.val + this.default);
  }
}

var test = new Test('one');
test.foo('haha');

var test2 = new Test2('two');
test2.foo('hehe');
