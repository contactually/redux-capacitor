'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRequestData = exports.applyResponseStrategy = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _pick2 = require('lodash/pick');

var _pick3 = _interopRequireDefault(_pick2);

var _castArray2 = require('lodash/castArray');

var _castArray3 = _interopRequireDefault(_castArray2);

var _has2 = require('lodash/has');

var _has3 = _interopRequireDefault(_has2);

var _isUndefined2 = require('lodash/isUndefined');

var _isUndefined3 = _interopRequireDefault(_isUndefined2);

var _pickBy2 = require('lodash/pickBy');

var _pickBy3 = _interopRequireDefault(_pickBy2);

var _compact2 = require('lodash/compact');

var _compact3 = _interopRequireDefault(_compact2);

var _uniqueId2 = require('lodash/uniqueId');

var _uniqueId3 = _interopRequireDefault(_uniqueId2);

var _immutable = require('immutable');

var _effects = require('redux-saga/effects');

var _index = require('../../index');

var _actions = require('../actions');

var _actions2 = _interopRequireDefault(_actions);

var _selectors = require('../selectors');

var _selectors2 = _interopRequireDefault(_selectors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = /*#__PURE__*/_regenerator2.default.mark(getRequestData),
    _marked2 = /*#__PURE__*/_regenerator2.default.mark(applyResponseStrategy),
    _marked3 = /*#__PURE__*/_regenerator2.default.mark(performAction);

/**
 * Given a request description, return a unique id.
 *
 * @param  {object} request
 * @param  {string} request.method
 * @param  {string} request.uri
 * @param  {string} request.params
 * @return {string}
 */
var getRequestId = function getRequestId(_ref) {
  var method = _ref.method,
      uri = _ref.uri,
      params = _ref.params;
  return method === 'get' ? (0, _stringify2.default)({ method: method, uri: uri, params: params }) : (0, _uniqueId3.default)('request_');
};

/**
 * Returns a function to be used as the pattern for `take` which matches
 * an API request completion for a given requestId.
 *
 * @param  {string} requestId
 * @return {bool}
 */
var getResponseMatcher = function getResponseMatcher(requestId) {
  return function (_ref2) {
    var type = _ref2.type,
        payload = _ref2.payload;
    return (type === _actions2.default.S.API_REQUEST.SUCCESS || type === _actions2.default.S.API_REQUEST.FAILURE) && payload.requestId === requestId;
  };
};

var uriFromParts = function uriFromParts() {
  for (var _len = arguments.length, parts = Array(_len), _key = 0; _key < _len; _key++) {
    parts[_key] = arguments[_key];
  }

  return (0, _compact3.default)(parts).join('/');
};

/**
 * Takes an action payload (from performAction) and returns a request
 * description.
 *
 * @param  {object} actionPayload
 * @return {object}
 */
var getRequestDescription = function getRequestDescription(actionPayload) {
  var type = actionPayload.type,
      action = actionPayload.action,
      scope = actionPayload.scope,
      itemId = actionPayload.itemId,
      params = actionPayload.params,
      data = actionPayload.data,
      onSuccess = actionPayload.onSuccess,
      onError = actionPayload.onError,
      tolerance = actionPayload.tolerance;
  var _EntitiesConfig$resou = _index.EntitiesConfig.resourceConfig[type],
      endpoint = _EntitiesConfig$resou.endpoint,
      availableActions = _EntitiesConfig$resou.actions;


  if (!availableActions || !availableActions[action]) {
    throw new Error('Unknown action for ' + type + ': ' + action);
  }

  var _availableActions$act = availableActions[action],
      method = _availableActions$act.method,
      path = _availableActions$act.path,
      _availableActions$act2 = _availableActions$act.schemaType,
      schemaType = _availableActions$act2 === undefined ? type : _availableActions$act2,
      associationKey = _availableActions$act.associationKey;


  var description = {
    method: method,
    uri: uriFromParts(scope, endpoint, itemId, path),
    params: (0, _pickBy3.default)(params, function (value) {
      return !(0, _isUndefined3.default)(value);
    }),
    data: data,
    onSuccess: onSuccess,
    onError: onError,
    schemaType: schemaType,
    associationKey: associationKey,
    itemId: itemId,
    tolerance: tolerance,
    baseSchemaType: type
  };

  return (0, _extends3.default)({
    requestId: getRequestId(description)
  }, description);
};

/**
 * Attempts to use a cached response, otherwise triggers a request and return
 * the response. If there's already a pending request with the same requestID
 * it will not make a duplicate request.
 *
 * @param  {object}    requestDescription
 * @param  {object}    options
 * @return {Generator}
 */
function getRequestData(requestDescription, options) {
  var containerId, _options$tolerance, tolerance, requestId, requests, request, hasError, withinTolerance, pending, responseMatcher, _ref3, requestData, error;

  return _regenerator2.default.wrap(function getRequestData$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          containerId = options.containerId, _options$tolerance = options.tolerance, tolerance = _options$tolerance === undefined ? 5000 : _options$tolerance;
          requestId = requestDescription.requestId;
          _context.next = 4;
          return (0, _effects.select)(_selectors2.default.requests);

        case 4:
          requests = _context.sent;
          request = requests.get(requestId, (0, _immutable.fromJS)({}));

          // If there was a previous successful response within our request tolerance
          // reuse that response.

          hasError = request.getIn(['response', 'errors']);
          withinTolerance = new Date().getTime() - request.get('respondedAt', 0) < tolerance;

          if (!(!hasError && withinTolerance)) {
            _context.next = 10;
            break;
          }

          return _context.abrupt('return', { requestData: request.toJS() });

        case 10:

          // If this request isn't currently pending, trigger the request.
          pending = request.get('requestedAt', 0) > request.get('respondedAt', 0);

          if (pending) {
            _context.next = 14;
            break;
          }

          _context.next = 14;
          return (0, _effects.put)(_actions2.default.S.API_REQUEST.trigger(requestDescription));

        case 14:
          _context.next = 16;
          return (0, _effects.put)(_actions2.default.D.addActiveRequest({ containerId: containerId, requestId: requestId }));

        case 16:
          responseMatcher = getResponseMatcher(requestId);
          _context.next = 19;
          return (0, _effects.take)(responseMatcher);

        case 19:
          _ref3 = _context.sent;
          requestData = _ref3.payload;
          error = _ref3.error;
          return _context.abrupt('return', { requestData: requestData, error: error });

        case 23:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked, this);
}

/**
 * Given a request and response, apply the given strategy to the response.
 * The strategy can be one of: ['append', 'prepend', 'ignore', 'replace', 'subtract']
 *
 * @param  {object}    givenPayload
 * @param  {object}    response
 * @return {Generator}
 */
function applyResponseStrategy(givenPayload, response) {
  var containerId, _givenPayload$respons, responseStrategy, containerState, existingIds, data;

  return _regenerator2.default.wrap(function applyResponseStrategy$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          containerId = givenPayload.containerId, _givenPayload$respons = givenPayload.responseStrategy, responseStrategy = _givenPayload$respons === undefined ? 'replace' : _givenPayload$respons;

          // If there were no ids passed back or we're ignoring, don't return anything.

          if (!(!(0, _has3.default)(response, 'ids') || responseStrategy === 'ignore')) {
            _context2.next = 3;
            break;
          }

          return _context2.abrupt('return', {});

        case 3:
          _context2.next = 5;
          return (0, _effects.select)(_selectors2.default.containerState(containerId));

        case 5:
          containerState = _context2.sent;
          existingIds = containerState.get('ids');
          data = { meta: response.meta

            // Apply the given strategy
          };
          if (responseStrategy === 'append') {
            data.ids = (0, _immutable.OrderedSet)().concat(existingIds).concat(response.ids).toList();
          } else if (responseStrategy === 'prepend') {
            data.ids = (0, _immutable.OrderedSet)().concat(response.ids).concat(existingIds).toList();
          } else if (responseStrategy === 'replace') {
            data.ids = (0, _immutable.OrderedSet)((0, _castArray3.default)(response.ids)).toList();
          } else if (responseStrategy === 'subtract') {
            data.ids = (0, _immutable.OrderedSet)(existingIds).subtract((0, _castArray3.default)(response.ids)).toList();
          }

          return _context2.abrupt('return', data);

        case 10:
        case 'end':
          return _context2.stop();
      }
    }
  }, _marked2, this);
}

/**
 * Perform an action against the API.
 *
 * @param  {object}    givenPayload
 * @return {Generator}
 */
function performAction(givenPayload) {
  var containerId, containerState, requestDescription, requestId, _ref4, requestData, error, containerData;

  return _regenerator2.default.wrap(function performAction$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          containerId = givenPayload.containerId;
          _context3.next = 3;
          return (0, _effects.select)(_selectors2.default.containerState(containerId));

        case 3:
          containerState = _context3.sent;


          if ((0, _isUndefined3.default)(givenPayload.scope)) {
            givenPayload.scope = containerState.get('scope');
          }

          if ((0, _isUndefined3.default)(givenPayload.params)) {
            givenPayload.params = givenPayload.filters || containerState.get('filters').toJS();
          }

          requestDescription = getRequestDescription(givenPayload);
          requestId = requestDescription.requestId;
          _context3.prev = 8;
          _context3.next = 11;
          return (0, _effects.call)(getRequestData, requestDescription, givenPayload);

        case 11:
          _ref4 = _context3.sent;
          requestData = _ref4.requestData;
          error = _ref4.error;
          containerData = void 0;

          if (error) {
            _context3.next = 22;
            break;
          }

          _context3.next = 18;
          return (0, _effects.call)(applyResponseStrategy, givenPayload, requestData.response);

        case 18:
          containerData = _context3.sent;

          containerData.errors = [];
          _context3.next = 23;
          break;

        case 22:
          containerData = (0, _pick3.default)(requestData.response, 'errors');

        case 23:
          _context3.next = 25;
          return (0, _effects.put)(_actions2.default.D.mergeContainerData((0, _extends3.default)({ containerId: containerId }, containerData)));

        case 25:
          if (error) {
            _context3.next = 30;
            break;
          }

          _context3.next = 28;
          return (0, _effects.put)(_actions2.default.S.PERFORM_ACTION.success((0, _extends3.default)({ containerId: containerId }, requestData)));

        case 28:
          _context3.next = 32;
          break;

        case 30:
          _context3.next = 32;
          return (0, _effects.put)(_actions2.default.S.PERFORM_ACTION.failure((0, _extends3.default)({ containerId: containerId }, requestData), error));

        case 32:
          _context3.prev = 32;
          _context3.next = 35;
          return (0, _effects.put)(_actions2.default.D.deleteActiveRequest({ containerId: containerId, requestId: requestId }));

        case 35:
          return _context3.finish(32);

        case 36:
        case 'end':
          return _context3.stop();
      }
    }
  }, _marked3, this, [[8,, 32, 36]]);
}

exports.applyResponseStrategy = applyResponseStrategy;
exports.getRequestData = getRequestData;
exports.default = performAction;