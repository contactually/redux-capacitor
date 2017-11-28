'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _class, _temp;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SagaProvider = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(SagaProvider, _Component);

  function SagaProvider() {
    (0, _classCallCheck3.default)(this, SagaProvider);
    return (0, _possibleConstructorReturn3.default)(this, (SagaProvider.__proto__ || (0, _getPrototypeOf2.default)(SagaProvider)).apply(this, arguments));
  }

  (0, _createClass3.default)(SagaProvider, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        sagas: this.props.middleware
      };
    }
  }, {
    key: 'render',
    value: function render() {
      return _react.Children.only(this.props.children);
    }
  }]);
  return SagaProvider;
}(_react.Component), _class.propTypes = {
  children: _propTypes2.default.node,
  middleware: _propTypes2.default.func.isRequired
}, _class.childContextTypes = {
  sagas: _propTypes2.default.func.isRequired
}, _temp);
exports.default = SagaProvider;