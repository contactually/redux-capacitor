'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _effects = require('redux-saga/effects');

var _actions = require('../actions');

var _actions2 = _interopRequireDefault(_actions);

var _selectors = require('../selectors');

var _selectors2 = _interopRequireDefault(_selectors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = /*#__PURE__*/_regenerator2.default.mark(initializeContainer);

/**
 * Initialize a given container.
 *
 * @param  {object} givenPayload
 * @return {void}
 */
function initializeContainer(givenPayload) {
  var containerId, oldContainerState, newContainerState;
  return _regenerator2.default.wrap(function initializeContainer$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          containerId = givenPayload.containerId;
          _context.next = 3;
          return (0, _effects.select)(_selectors2.default.containerState(containerId));

        case 3:
          oldContainerState = _context.sent;
          newContainerState = oldContainerState.merge(givenPayload).toObject();
          _context.next = 7;
          return (0, _effects.put)(_actions2.default.D.mergeContainerData(newContainerState));

        case 7:
          _context.next = 9;
          return (0, _effects.put)(_actions2.default.S.INITIALIZE_CONTAINER.success(newContainerState));

        case 9:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked, this);
}

exports.default = initializeContainer;