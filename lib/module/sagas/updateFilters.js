'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _reduxSaga = require('redux-saga');

var _effects = require('redux-saga/effects');

var _actions = require('../actions');

var _actions2 = _interopRequireDefault(_actions);

var _performAction = require('./performAction');

var _performAction2 = _interopRequireDefault(_performAction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = /*#__PURE__*/_regenerator2.default.mark(updateFilters);

/**
 * Update the filters for a given container.
 *
 * @param  {object} givenPayload
 * @return {void}
 */
function updateFilters() {
  var givenPayload = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var containerId, _givenPayload$filters, filters, _givenPayload$debounc, debounce, _givenPayload$resetCo, resetContainer, _givenPayload$resetFi, resetFilters, rest;

  return _regenerator2.default.wrap(function updateFilters$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          containerId = givenPayload.containerId, _givenPayload$filters = givenPayload.filters, filters = _givenPayload$filters === undefined ? {} : _givenPayload$filters, _givenPayload$debounc = givenPayload.debounce, debounce = _givenPayload$debounc === undefined ? true : _givenPayload$debounc, _givenPayload$resetCo = givenPayload.resetContainer, resetContainer = _givenPayload$resetCo === undefined ? false : _givenPayload$resetCo, _givenPayload$resetFi = givenPayload.resetFilters, resetFilters = _givenPayload$resetFi === undefined ? false : _givenPayload$resetFi, rest = (0, _objectWithoutProperties3.default)(givenPayload, ['containerId', 'filters', 'debounce', 'resetContainer', 'resetFilters']);

          if (!resetContainer) {
            _context.next = 4;
            break;
          }

          _context.next = 4;
          return (0, _effects.put)(_actions2.default.D.resetContainerData({ containerId: containerId }));

        case 4:

          // When a filter other than the page changes, move back to the first page.
          if (!filters.page) {
            filters.page = 1;
          }

          // Merge the filters into the container

          if (!(resetFilters === true)) {
            _context.next = 10;
            break;
          }

          _context.next = 8;
          return (0, _effects.put)(_actions2.default.D.setFilters({ containerId: containerId, filters: filters }));

        case 8:
          _context.next = 12;
          break;

        case 10:
          _context.next = 12;
          return (0, _effects.put)(_actions2.default.D.mergeFilters({ containerId: containerId, filters: filters }));

        case 12:
          if (!debounce) {
            _context.next = 15;
            break;
          }

          _context.next = 15;
          return (0, _effects.call)(_reduxSaga.delay, 400);

        case 15:
          _context.next = 17;
          return (0, _effects.call)(_performAction2.default, (0, _extends3.default)({
            containerId: containerId,
            action: 'list'
          }, rest));

        case 17:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked, this);
}

exports.default = updateFilters;