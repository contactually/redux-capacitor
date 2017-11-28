'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

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

var _isPlainObject2 = require('lodash/isPlainObject');

var _isPlainObject3 = _interopRequireDefault(_isPlainObject2);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var wrapObjectOrIds = function wrapObjectOrIds(objectOrIds) {
  return (0, _isPlainObject3.default)(objectOrIds) ? objectOrIds : { ids: objectOrIds

    /**
     * Gives the wrapped component an identity or uses the one provided by props.
     *
     * @param {object} containers
     * @param {string} identPrefix
     * @returns {function}
     */
  };
};function identify(containers, identPrefix) {
  return function wrapWithIdentify(WrappedComponent) {
    var _class, _temp;

    return _temp = _class = function (_React$Component) {
      (0, _inherits3.default)(Identify, _React$Component);

      function Identify(props) {
        (0, _classCallCheck3.default)(this, Identify);

        // See: http://stackoverflow.com/a/30925561/825269)
        var _this = (0, _possibleConstructorReturn3.default)(this, (Identify.__proto__ || (0, _getPrototypeOf2.default)(Identify)).call(this, props));

        _this.getContainerProps = function () {
          return (0, _keys2.default)(containers).reduce(function (memo, key) {
            var containerId = _this.ident + '-' + key;

            memo[key] = _this.props[key] ? (0, _extends3.default)({ containerId: containerId }, wrapObjectOrIds(_this.props[key])) : { containerId: containerId };

            return memo;
          }, {});
        };

        _this.ident = identPrefix || props.ident || (Math.random() * 1e32).toString(36);
        return _this;
      }

      (0, _createClass3.default)(Identify, [{
        key: 'render',
        value: function render() {
          return React.createElement(WrappedComponent, (0, _extends3.default)({}, this.props, this.getContainerProps()));
        }
      }]);
      return Identify;
    }(React.Component), _class.displayName = 'Identify(' + (WrappedComponent.displayName || WrappedComponent.name) + ')', _class.propTypes = {
      ident: _propTypes2.default.string
    }, _temp;
  };
}

exports.default = identify;