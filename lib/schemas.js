'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.schemasFromFieldDefinitions = undefined;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _normalizr = require('normalizr');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Creates a Schema for each of the given record types.
 */
function schemasFromFieldDefinitions(fieldDefinitions, schemaDefinitions) {
  var allSchemaTypes = (0, _keys2.default)(fieldDefinitions).concat((0, _keys2.default)(schemaDefinitions));
  return allSchemaTypes.reduce(function (memo, schemaType) {
    memo[schemaType] = new _normalizr.Schema(schemaType, schemaDefinitions[schemaType]);
    return memo;
  }, {});
}

exports.schemasFromFieldDefinitions = schemasFromFieldDefinitions;