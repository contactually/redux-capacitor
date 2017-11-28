'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.entities = exports.EntitiesConfig = undefined;

var _Entities = require('./components/Entities');

var _Entities2 = _interopRequireDefault(_Entities);

var _Entities3 = require('./Entities');

var _Entities4 = _interopRequireDefault(_Entities3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EntitiesConfig = new _Entities4.default();

exports.EntitiesConfig = EntitiesConfig;
exports.entities = _Entities2.default;