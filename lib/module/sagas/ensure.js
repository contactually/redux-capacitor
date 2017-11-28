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

exports.fetch = fetch;
exports.default = ensure;

var _performAction = require('../sagas/performAction');

var _performAction2 = _interopRequireDefault(_performAction);

var _initializeContainer = require('../sagas/initializeContainer');

var _initializeContainer2 = _interopRequireDefault(_initializeContainer);

var _selectors = require('../selectors');

var _selectors2 = _interopRequireDefault(_selectors);

var _effects = require('redux-saga/effects');

var _immutable = require('immutable');

var _assertPlus = require('assert-plus');

var _assertPlus2 = _interopRequireDefault(_assertPlus);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = /*#__PURE__*/_regenerator2.default.mark(fetch),
    _marked2 = /*#__PURE__*/_regenerator2.default.mark(selectEntityItems),
    _marked3 = /*#__PURE__*/_regenerator2.default.mark(ensure);

/**
 * Fetches a list of entities
 * @param {string}  type - entity type
 * @param {object}   params  - array of ids to fetch
 * @param {object=} rest - additional params to send
 * @returns {{items: *, item: *}}
 */
function fetch(_ref) {
  var type = _ref.type,
      params = _ref.params,
      rest = (0, _objectWithoutProperties3.default)(_ref, ['type', 'params']);
  var ephemeralContainerId, items;
  return _regenerator2.default.wrap(function fetch$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          // todo this container should be removed after we're done getting data
          ephemeralContainerId = 'fetch-' + (Math.random() * 1e32).toString(36);
          _context.next = 3;
          return (0, _effects.call)(_initializeContainer2.default, { containerId: ephemeralContainerId, type: type });

        case 3:
          _context.next = 5;
          return (0, _effects.call)(_performAction2.default, (0, _extends3.default)({
            containerId: ephemeralContainerId,
            action: 'list',
            type: type,
            params: params
          }, rest, {
            // unfortunately, since api/v2/interactions has a `read` action,
            // but not an `index` action, we need to force entites to look at
            // the `read` action for this very specific object type :(
            itemId: type === 'interaction' ? params.id : undefined
          }));

        case 5:
          _context.next = 7;
          return (0, _effects.select)(_selectors2.default.containerItems(ephemeralContainerId));

        case 7:
          items = _context.sent;
          return _context.abrupt('return', {
            items: items,
            item: items.first()
          });

        case 9:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked, this);
}

/**
 * @param {string} type
 * @param {Array}  ids
 * @returns {List}
 */
function selectEntityItems(_ref2) {
  var type = _ref2.type,
      ids = _ref2.ids;
  var response;
  return _regenerator2.default.wrap(function selectEntityItems$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return (0, _effects.select)(_selectors2.default.entityItems, { type: type, ids: (0, _immutable.fromJS)(ids) });

        case 2:
          response = _context2.sent;
          return _context2.abrupt('return', response.filter(function (item) {
            return item instanceof _immutable.Record;
          }));

        case 4:
        case 'end':
          return _context2.stop();
      }
    }
  }, _marked2, this);
}

/**
 * Ensures an entity or list of entities exist in the store
 * @param {object}  options
 * @param {string}  options.type      - entity type
 * @param {object}  options.params    - additional params to send
 * @param {Array}   options.params.id - ids to fetch
 * @returns {{items: *, item: *}}
 */
function ensure(options) {
  var params, type, rest, existingItems, existingIds, missingIds, resolvedItems;
  return _regenerator2.default.wrap(function ensure$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          params = options.params, type = options.type, rest = (0, _objectWithoutProperties3.default)(options, ['params', 'type']);

          _assertPlus2.default.object(params, 'params');
          _assertPlus2.default.array(params.id, 'params.id');
          _assertPlus2.default.string(type, 'type');

          _context3.next = 6;
          return (0, _effects.call)(selectEntityItems, { type: type, ids: params.id });

        case 6:
          existingItems = _context3.sent;
          existingIds = existingItems.map(function (item) {
            return item.id;
          });
          missingIds = (0, _immutable.List)(params.id).toSet().subtract(existingIds);

          /**
           * @yields {Array}
           * chunks the remaining missing ids into groups of 50
           * an array of fetch effects, which executes all
           * effects in parallel. see redux-saga's `all` effect
           * documentation for more info.
           */

          _context3.next = 11;
          return (0, _immutable.Range)(0, missingIds.size, 50).map(function (chunkStart) {
            return missingIds.slice(chunkStart, chunkStart + 50);
          }).map(function (chunkIds) {
            return (0, _effects.call)(fetch, (0, _extends3.default)({ type: type, params: (0, _extends3.default)({}, params, { id: chunkIds }) }, rest));
          }).toArray();

        case 11:
          _context3.next = 13;
          return (0, _effects.call)(selectEntityItems, { type: type, ids: params.id }) || (0, _immutable.List)();

        case 13:
          resolvedItems = _context3.sent;
          return _context3.abrupt('return', {
            items: resolvedItems,
            item: resolvedItems.first()
          });

        case 15:
        case 'end':
          return _context3.stop();
      }
    }
  }, _marked3, this);
}