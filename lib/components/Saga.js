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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Decorator that wraps component in Saga HOC
 *
 * @param  {Saga} mountSaga
 * @param  {Saga} updateSaga
 * @return {Component}
 */
function saga(mountSaga, updateSaga) {
  return function wrapWithSaga(WrappedComponent) {
    var _class, _temp2;

    return _temp2 = _class = function (_Component) {
      (0, _inherits3.default)(Saga, _Component);

      function Saga() {
        var _ref;

        var _temp, _this, _ret;

        (0, _classCallCheck3.default)(this, Saga);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = Saga.__proto__ || (0, _getPrototypeOf2.default)(Saga)).call.apply(_ref, [this].concat(args))), _this), _this.runningSagas = [], _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
      }

      (0, _createClass3.default)(Saga, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
          if (!this.context.sagas) {
            throw new Error('Did you forget to include <SagaProvider/>?');
          }

          if (mountSaga) {
            this.runningSagas.push(this.context.sagas.run(mountSaga, this.props));
          }
        }
      }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
          if (updateSaga) {
            this.runningSagas.push(this.context.sagas.run(updateSaga, nextProps, this.props));
          }

          if (this.runningSagas.length > 100) {
            this.runningSagas = this.runningSagas.filter(function (saga) {
              return saga.isRunning();
            });
          }
        }
      }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
          this.runningSagas.forEach(function (saga) {
            return saga.isRunning() && saga.cancel();
          });
          delete this.runningSaga;
        }
      }, {
        key: 'render',
        value: function render() {
          return _react2.default.createElement(WrappedComponent, this.props);
        }
      }]);
      return Saga;
    }(_react.Component), _class.displayName = 'Saga(' + (WrappedComponent.displayName || WrappedComponent.name) + ')', _class.contextTypes = {
      sagas: _propTypes2.default.func.isRequired
    }, _temp2;
  };
}

exports.default = saga;