'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _records = require('./records');

var _schemas = require('./schemas');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EntitiesSingleton = function () {
  function EntitiesSingleton() {
    (0, _classCallCheck3.default)(this, EntitiesSingleton);
  }

  (0, _createClass3.default)(EntitiesSingleton, [{
    key: 'setFieldDefinitions',
    value: function setFieldDefinitions(fieldDefinitions) {
      var schemaDefinitions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      this.schemas = (0, _schemas.schemasFromFieldDefinitions)(fieldDefinitions, schemaDefinitions);
      this.records = (0, _records.recordsFromFieldDefinitions)(fieldDefinitions);
    }
  }, {
    key: 'setApiClient',
    value: function setApiClient(ApiClient) {
      this.ApiClient = ApiClient;
    }
  }, {
    key: 'setResourceConfig',
    value: function setResourceConfig(resourceConfig) {
      this.resourceConfig = resourceConfig;
    }
  }, {
    key: 'setConfig',
    value: function setConfig(Config) {
      this.Config = Config;
    }
  }]);
  return EntitiesSingleton;
}();

exports.default = EntitiesSingleton;