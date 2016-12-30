var test = require('tape');
var chatskills = require('../lib/chatskills');

test("app/skill creation with `app` succeeds", function(t) {
  t.doesNotThrow(function() { chatskills.app('hello') }, Error);
  t.end();
});

test("app/skill creation with `app` returns a value", function(t) {
  var hello = chatskills.app('hello');
  t.ok(hello);
  t.end();
});

test("app/skill creation with `app` fails with error when namespace is non-alphanumeric", function(t) {
  t.throws(function() { chatskills.app('hel lo') }, Error);
  t.throws(function() { chatskills.app('hel lo') }, /skill.*characters/);
  t.throws(function() { chatskills.app('hel_lo') }, Error);
  t.throws(function() { chatskills.app('hel_lo') }, /skill.*characters/);
  t.throws(function() { chatskills.app('hel-lo') }, Error);
  t.throws(function() { chatskills.app('hel-lo') }, /skill.*characters/);
  t.end();
});
