'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var r = require('ramda');

// pounce core
var parse = function (ps) { return r.split(' ', ps); };
var pounce = function (pl) { return ([[], r.map(function (p) { return p; }, pl)]); };

exports.parse = parse;
exports.pounce = pounce;