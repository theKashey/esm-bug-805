const assert = require('assert');
const Module = require('module');

const originalLoader = Module._load;

const trimPath = a => a.substr(__dirname.length) || a;

const getCache = () => Object.keys(require.cache).map(trimPath).join('-');

const cachedFiles = getCache();

if (1) {

  const cache = {...require.cache};

  Module._load = () => {
    return "mocked";
  };

  console.log('checking total override');

  assert.equal(require("./d"), 'mocked');
  assert.equal(require("./b"), 'mocked');
  assert.equal(require("./c"), 'mocked');
  assert.equal(require("./a"), 'mocked');

  console.log('ok');

  console.log('checking cache');
  assert.equal(getCache(), cachedFiles);
  console.log('ok');

  Module._load = originalLoader;

  assert.equal(require('./a').default, "a-b-42(/b.js)");
  assert.equal(require('./c').default, "42(/b.js)");

  // clear cache
  Object
    .keys(require.cache)
    .filter(key => !cache[key])
    .filter(key => key.indexOf('.node') < 0)
    .forEach(key => delete require.cache[key]);
}

if (1) {
  console.log('checking partial override');

  let queue = [];
  Module._load = (req, parent) => {
    if(['./a', './b', './c','./d'].includes(req)) {
      queue.push(req);
      console.log(req, trimPath(parent.id), trimPath(parent.parent ? parent.parent.id : '!'));
    }
    if (req === './d') {
      return trimPath(parent.id) + '-' + trimPath(parent.parent ? parent.parent.id : '!');
    }
    return originalLoader(req, parent);
  };

//  console.log(Object.keys(Module._cache).join('-'));

  const d= require("./d");
  assert.equal(d.default || d, '.-!');
  assert.equal(queue.join('-'), './d');
  queue = [];

  assert.equal(require("./a").default, 'a-b-/c.js-/b.js(/b.js)');
  assert.equal(queue.join('-'), './a-./b-./c-./d-./c');
  queue = [];

  assert.equal(require("./b").default, 'b-/c.js-/b.js(/b.js)');
  assert.equal(queue.join('-'), './b');
  queue = [];

  console.log('ok');
}
