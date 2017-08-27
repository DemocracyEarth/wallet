// Support for Transformers
// They convert step variables (remember, they're strings) that match
// - integers
// - floats
// into the appropriate type.
// Initially copied from : https://gist.github.com/jbpros/8414fc60f4fd072c12f3

// Also, cucumberry looks nice at first glance :
// https://github.com/hackhat/cucumberry/blob/prod/Readme.MD#parse-values-automatically

import {log, fail} from './utils';

let transforms = [];

function cast(value) {
  for (let i = 0; i < transforms.length; i++) {
    const transform = transforms[i];
    const matches = transform.pattern.exec(value);
    if (matches) {
      return transform.fn(matches);
    }
  }
  return value;
}

function t(fn) {
  let args = [];
  let body = 'var args = [];';
  for (let i=0; i<fn.length; i++) {
    args.push('arg' + i);
    body += 'args.push(this.cast(arg' + i + '));\n';
  }
  body += 'return this.fn.apply(this, args);';
  return Function.apply(null, args.concat([body])).bind({fn: fn, cast: cast});
}

// Nope. It's best to avoid the evils of eval, but we cannot make this work (for now).
// function t(fn) {
//   console.log(fn.length);
//   return function() {
//     console.log(arguments);
//     let ff = [];
//     for (let k of arguments) { ff.push(cast(k)); }
//     return fn.apply(this, ff);
//   };
// }

module.exports = function () {
  console.log("Setting up the transformers…");
  const _defineStep = this.defineStep;
  this.defineStep = function (pattern, fn) {
    return _defineStep(pattern, t(fn));
  };
  this.Given = this.When = this.Then = this.defineStep;
  this.Transform = function (pattern, fn) {
    transforms.push({ pattern: pattern, fn: fn });
  };

  this.Transform(/^(\d+)$/, function (matches) { return parseInt(matches[0]); });
  this.Transform(/^(\d+\.\d*|\d*\.\d+)$/, function (matches) { return parseFloat(matches[0]); });
};
