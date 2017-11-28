'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createItemResultSelector = exports.createShallowResultSelector = exports.immutableShallowEqual = exports.shallowEqual = exports.safeMergeDeep = exports.createReducer = exports.createRootSaga = exports.createWatcher = exports.createDeltaAction = exports.createSignalAction = exports.bindActionCreators = exports.createActionCreator = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _omit2 = require('lodash/omit');

var _omit3 = _interopRequireDefault(_omit2);

var _merge2 = require('lodash/merge');

var _merge3 = _interopRequireDefault(_merge2);

var _reduce2 = require('lodash/reduce');

var _reduce3 = _interopRequireDefault(_reduce2);

var _isArray2 = require('lodash/isArray');

var _isArray3 = _interopRequireDefault(_isArray2);

var _isObject2 = require('lodash/isObject');

var _isObject3 = _interopRequireDefault(_isObject2);

var _camelCase2 = require('lodash/camelCase');

var _camelCase3 = _interopRequireDefault(_camelCase2);

exports.mergeKey = mergeKey;

var _immutable = require('immutable');

var _effects = require('redux-saga/effects');

var _reselect = require('reselect');

var _shallowEqual = require('fbjs/lib/shallowEqual');

var _shallowEqual2 = _interopRequireDefault(_shallowEqual);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Given a type, return an "action creator" function that creates a redux
 * action of that type with the passed payload and error.
 *
 * @param  {string} type
 * @return {function}
 */
var createActionCreator = exports.createActionCreator = function createActionCreator(type) {
  return function (payload, error) {
    return {
      type: type,
      payload: payload,
      error: error
    };
  };
};

/**
 * Turns an object whose values are action creators, into an object with
 * the same keys, but with every action creator wrapped into a dispatch
 * call so they may be invoked directly.
 *
 * NOTE: Different than the `bindActionCreators` function provided by
 * the `redux` library because you can pass a default payload.
 *
 * @param  {object} actions
 * @param  {function} dispatch
 * @param  {object} defaultPayload
 * @return {object}
 */
var bindActionCreators = exports.bindActionCreators = function bindActionCreators(actions, dispatch, defaultPayload) {
  return (0, _keys2.default)(actions).reduce(function (memo, key) {
    memo[key] = function (payload) {
      var actionPayload = defaultPayload && payload ? (0, _extends3.default)({}, defaultPayload, payload) : defaultPayload || payload;

      return dispatch(actions[key](actionPayload));
    };
    return memo;
  }, {});
};

/**
 * Given a reducer and action name, return a hash with action constants and
 * action creators. For example:
 * {
 *   TRIGGER: 'S/reducerName/ACTION_NAME/TRIGGER',
 *   SUCCESS: 'S/reducerName/ACTION_NAME/SUCCESS',
 *   FAILURE: 'S/reducerName/ACTION_NAME/FAILURE',
 *   trigger: (payload, error) => ({ type: 'S/reducerName/ACTION_NAME/TRIGGER', payload, error }),
 *   success: (payload, error) => ({ type: 'S/reducerName/ACTION_NAME/SUCCESS', payload, error }),
 *   failure: (payload, error) => ({ type: 'S/reducerName/ACTION_NAME/FAILURE', payload, error })
 * }
 *
 * @param  {string} reducerName
 * @param  {string} actionName
 * @return {object}
 */
var createSignalAction = exports.createSignalAction = function createSignalAction(reducerName, actionName) {
  return ['TRIGGER', 'SUCCESS', 'FAILURE'].reduce(function (memo, type, index) {
    memo[type] = 'S/' + reducerName + '/' + actionName + '/' + type;
    memo[(0, _camelCase3.default)(type)] = createActionCreator(memo[type]);
    return memo;
  }, {});
};

/**
 * Given a reducer and action name, return a hash with action constants and
 * action creators. For example:
 * {
 *   ACTION_NAME: 'D/reducerName/ACTION_NAME',
 *   actionName: (payload, error) => { type: 'D/reducerName/ACTION_NAME', payload, error },
 * }
 *
 * @param  {string} reducerName
 * @param  {string} actionName
 * @return {object}
 */
var createDeltaAction = exports.createDeltaAction = function createDeltaAction(reducerName, actionName) {
  var _ref;

  var type = 'D/' + reducerName + '/' + actionName;

  return _ref = {}, (0, _defineProperty3.default)(_ref, actionName, type), (0, _defineProperty3.default)(_ref, (0, _camelCase3.default)(actionName), createActionCreator(type)), _ref;
};

/**
 * Returns a generator function to wait for a specific action and fork
 * a function.
 *
 * NOTE: Different than the vanilla `take` effect providedby redux-saga in two
 * ways:
 * - Destructures the action and calls the function with the action's keys
 * (e.g. payload) as separate arguments.
 * - Enables passing a resolver function that converts the action into a key
 * that is used to ensure only one action per key is running at any given time.
 *
 * @param  {string|array|function} pattern
 * @param  {function} fn
 * @param  {function} resolver
 * @return {[type]}
 */
var createWatcher = exports.createWatcher = function createWatcher(pattern, fn, resolver) {
  return (/*#__PURE__*/_regenerator2.default.mark(function _callee() {
      var tasks, action, taskId;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              tasks = {};

            case 1:
              if (!true) {
                _context.next = 14;
                break;
              }

              _context.next = 4;
              return (0, _effects.take)(pattern);

            case 4:
              action = _context.sent;
              taskId = resolver && resolver(action);

              if (!(resolver && tasks[taskId])) {
                _context.next = 9;
                break;
              }

              _context.next = 9;
              return (0, _effects.cancel)(tasks[taskId]);

            case 9:
              _context.next = 11;
              return (0, _effects.fork)(fn, action.payload, action.error, action.type);

            case 11:
              tasks[taskId] = _context.sent;
              _context.next = 1;
              break;

            case 14:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    })
  );
};

/**
 * Given an array of generator functions, return one function that forks all
 * of them.
 *
 * @param  {array} sagas
 * @return {Generator}
 */
var createRootSaga = exports.createRootSaga = function createRootSaga(sagas) {
  return (/*#__PURE__*/_regenerator2.default.mark(function _callee2() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return sagas.map(function (saga) {
                return _effects.fork.apply(undefined, [saga].concat(args));
              });

            case 2:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this);
    })
  );
};

/**
 * Expects a map of redux action type to handler. The handler should be a
 * function that returns a new state given the old state and action payload.
 * If no handler is found for a given action, the old state is returned.
 *
 * @param  {any} initialState
 * @param  {object} handlers
 * @return {function}
 */
var createReducer = exports.createReducer = function createReducer(initialState, handlers) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var _ref2 = arguments[1];
    var type = _ref2.type,
        payload = _ref2.payload,
        error = _ref2.error;
    return handlers[type] ? handlers[type](state, payload, error) : state;
  };
};

var isList = _immutable.List.isList;
var isMap = _immutable.Map.isMap;
var isObject = _isObject3.default;
var isRecord = function isRecord(a) {
  return a && isMap(a._map);
}; // There's no built-in `isRecord` :|

/**
 * Custom 'merger' function for use with Immutable `mergeWith` that manually
 * merges records to prevent raising errors when there are unknown keys.
 *
 * @param  {any} a
 * @param  {any} b
 * @return {any}
 */
var safeMergeDeep = exports.safeMergeDeep = function safeMergeDeep(a, b) {
  if (isRecord(a) && isObject(b)) {
    // Based on merge functionality in Map which record inherits:
    // https://github.com/facebook/immutable-js/blob/master/src/Map.js#L756-L778
    return a.withMutations(function (record) {
      return (0, _immutable.fromJS)(b).forEach(function (value, key) {
        // The `record.has` check ensures we don't try setting keys that
        // don't exist on the record.
        // The `is` check is a bit more complicated. For immutable maps and
        // records, when using set or merge if nothing actually changed it
        // will try to return the same reference. Without this check, if
        // the value here is a non-primitive calling set will still cause
        // the record's reference to change. So to prevent that, we use
        // a deeper equals check.
        if (record.has(key) && !(0, _immutable.is)(record.get(key), value)) {
          record.set(key, value);
        }
      });
    });
  }

  return a && a.mergeWith && !isList(a) && !isList(b) ? a.mergeWith(safeMergeDeep, b) : b;
};

/**
 * Performs an efficient shallow equality of two things.
 *
 * @return {boolean}
 */
var shallowEqual = exports.shallowEqual = _shallowEqual2.default;

/* eslint-disable no-self-compare */
/**
 * Mix of shallowEqual and Immutable.is.
 *
 * @param  {any} valueA
 * @param  {any} valueB
 * @return {boolean}
 */
var immutableShallowEqual = exports.immutableShallowEqual = function immutableShallowEqual(valueA, valueB) {
  if (valueA === valueB || valueA !== valueA && valueB !== valueB) {
    return true;
  }
  if (!valueA || !valueB) {
    return false;
  }
  if (typeof valueA.valueOf === 'function' && typeof valueB.valueOf === 'function') {
    valueA = valueA.valueOf();
    valueB = valueB.valueOf();
    if (valueA === valueB || valueA !== valueA && valueB !== valueB) {
      return true;
    }
    if (!valueA || !valueB) {
      return false;
    }
  }
  // Instead of recursively/deeply comparing valueA and valueB, shallowly
  // compare the key/values one level deep.
  if (typeof valueA.get === 'function' && typeof valueB.get === 'function' && valueA.size === valueB.size) {
    return valueA.every(function (value, key) {
      return valueB.get(key) === value;
    });
  }
  return false;
};
/* eslint-enable no-self-compare */

// This is just defaultMemoize from `reselect` with a small tweak exlained
// in a comment inline.
var resultEqualityMemoize = function resultEqualityMemoize(func) {
  var resultEqualityCheck = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : shallowEqual;

  var lastArgs = null;
  var lastResult = null;
  var isEqualToLastArg = function isEqualToLastArg(value, index) {
    return value === lastArgs[index];
  };
  return function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    if (lastArgs === null || lastArgs.length !== args.length || !args.every(isEqualToLastArg)) {
      var newResult = func.apply(undefined, args);

      // In default memoize, lastResult is always set to the computed value.
      // This performs a deep equality check which is a little more expensive
      // but ensures that if the result does not actually change referential
      // equality is maintained. This is a tradeoff to make equality checks
      // faster at the component level.
      if (!resultEqualityCheck(newResult, lastResult)) {
        lastResult = newResult;
      }
    }
    lastArgs = args;
    return lastResult;
  };
};

var toItemSet = function toItemSet(itemList) {
  return itemList.reduce(function (memo) {
    var item = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return memo.set(item.id, item);
  }, (0, _immutable.OrderedMap)());
};

var diffItems = function diffItems(lastItemSet, newResultSet) {
  return newResultSet.size > 0 ? newResultSet.mergeWith(function (newItem, lastItem, key) {
    return (0, _immutable.is)(lastItem, newItem) ? lastItem : newItem;
  }, lastItemSet).filter(function (_, key) {
    return newResultSet.get(key);
  }).toList() : (0, _immutable.List)();
};

// This is just defaultMemoize from `reselect` with a small tweak exlained
// in a comment inline.
var resultItemEqualityMemoize = function resultItemEqualityMemoize(func) {
  var resultEqualityCheck = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : shallowEqual;

  var lastArgs = null;
  var lastResult = null;
  var lastItemSet = null;
  var isEqualToLastArg = function isEqualToLastArg(value, index) {
    return value === lastArgs[index];
  };
  return function () {
    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    if (lastArgs === null || lastArgs.length !== args.length || !args.every(isEqualToLastArg)) {
      var newResult = func.apply(undefined, args);
      if (!lastResult) {
        lastResult = newResult;
        lastItemSet = toItemSet(newResult);
      } else if (!resultEqualityCheck(newResult, lastResult)) {
        var newResultSet = toItemSet(newResult);
        lastResult = diffItems(lastItemSet, newResultSet);
        lastItemSet = newResultSet;
      }
    }

    lastArgs = args;
    return lastResult;
  };
};

/**
 * Recursively merges key into the containing object.
 *
 * @param {object|array} input - e.g. contact
 * @param {string} key
 * @returns {object|array} Object or Array with merged keys
 */
function mergeKey(input, key) {
  var merge = function merge(object) {
    return mergeKey(object, key);
  };

  if ((0, _isArray3.default)(input)) {
    return input.map(merge);
  } else if ((0, _isObject3.default)(input)) {
    var object = (0, _reduce3.default)(input, function (result, value, objectKey) {
      result[objectKey] = merge(value);
      return result;
    }, {});

    return object[key] ? (0, _merge3.default)((0, _omit3.default)(object, key), object[key]) : object;
  } else {
    return input;
  }
}

var createShallowResultSelector = exports.createShallowResultSelector = (0, _reselect.createSelectorCreator)(resultEqualityMemoize, immutableShallowEqual);
var createItemResultSelector = exports.createItemResultSelector = (0, _reselect.createSelectorCreator)(resultItemEqualityMemoize, _immutable.is);