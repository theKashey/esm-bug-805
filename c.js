import d from './d';

export default d + '('+module.parent.id.substr(__dirname.length)+')';

// exports.default = require('./d');