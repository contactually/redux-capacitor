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

var _chunk2 = require('lodash/chunk');

var _chunk3 = _interopRequireDefault(_chunk2);

var _effects = require('redux-saga/effects');

var _actions = require('../actions');

var _actions2 = _interopRequireDefault(_actions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = /*#__PURE__*/_regenerator2.default.mark(fetchAll);

var API_PAGINATION_LIMIT = 50;

/**
 * Fetch all entities in batches.
 *
 * @param  {object} givenPayload
 * @return {void}
 */
function fetchAll(givenPayload) {
  var _givenPayload$params, params, rest;

  return _regenerator2.default.wrap(function fetchAll$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _givenPayload$params = givenPayload.params, params = _givenPayload$params === undefined ? {} : _givenPayload$params, rest = (0, _objectWithoutProperties3.default)(givenPayload, ['params']);
          _context.next = 3;
          return (0, _chunk3.default)(params.id || [], API_PAGINATION_LIMIT).map(function (slice) {
            return (0, _effects.put)(_actions2.default.S.PERFORM_ACTION.trigger((0, _extends3.default)({
              action: 'list',
              params: (0, _extends3.default)({}, params, { id: slice })
            }, rest)));
          });

        case 3:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked, this);
}

exports.default = fetchAll;