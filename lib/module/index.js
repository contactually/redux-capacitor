'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _identity = require('./identity');

var _identity2 = _interopRequireDefault(_identity);

var _actions = require('./actions');

var _actions2 = _interopRequireDefault(_actions);

var _sagas = require('./sagas');

var _sagas2 = _interopRequireDefault(_sagas);

var _reducer = require('./reducer');

var _reducer2 = _interopRequireDefault(_reducer);

var _selectors = require('./selectors');

var _selectors2 = _interopRequireDefault(_selectors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = { MODULE_NAME: _identity2.default, actions: _actions2.default, rootSaga: _sagas2.default, rootReducer: _reducer2.default, selectors: _selectors2.default };