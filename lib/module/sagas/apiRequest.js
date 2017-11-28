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

var _set2 = require('lodash/set');

var _set3 = _interopRequireDefault(_set2);

var _startsWith2 = require('lodash/startsWith');

var _startsWith3 = _interopRequireDefault(_startsWith2);

var _isArrayLike2 = require('lodash/isArrayLike');

var _isArrayLike3 = _interopRequireDefault(_isArrayLike2);

var _isNil2 = require('lodash/isNil');

var _isNil3 = _interopRequireDefault(_isNil2);

var _some2 = require('lodash/some');

var _some3 = _interopRequireDefault(_some2);

var _effects = require('redux-saga/effects');

var _normalizr = require('normalizr');

var _utils = require('../utils');

var _actions = require('../actions');

var _actions2 = _interopRequireDefault(_actions);

var _index = require('../../index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = /*#__PURE__*/_regenerator2.default.mark(makeRequest),
    _marked2 = /*#__PURE__*/_regenerator2.default.mark(apiRequest);

var DUMMY_ERROR_RESPONSE = {
  status: 500,
  errors: ['An unexpected error occurred.']
};

var isAsUserError = function isAsUserError(response) {
  return response.status === 403 && (0, _some3.default)(response.errors, function (m) {
    return m.match('No active as-user session') || m.match("Couldn't find User");
  });
};

/**
 * Take a response and normalize the response data (if applicable).
 *
 * @param  {[type]} givenResponse [description]
 * @param  {[type]} schemaType    [description]
 * @return {[type]}               [description]
 */
var normalizeResponse = function normalizeResponse(givenResponse, schemaType) {
  var data = givenResponse.data,
      response = (0, _objectWithoutProperties3.default)(givenResponse, ['data']);

  // If the response has no data key, No data needs to be merged,
  // so return an empty map.
  // TODO: For consistency this should be wrapped as an object, but there are
  // things that depend on it being unwrapped. Leaving as-is for now.

  if ((0, _isNil3.default)(data)) return response;

  // Some resource actions return a 'job' identifier, so we filter those
  // out for now.
  if (!(0, _isArrayLike3.default)(data) && (0, _startsWith3.default)(data.id, 'job_')) return { response: response };

  var schema = (0, _isArrayLike3.default)(data) ? (0, _normalizr.arrayOf)(_index.EntitiesConfig.schemas[schemaType]) : _index.EntitiesConfig.schemas[schemaType];

  var cleanData = (0, _utils.mergeKey)(data, 'extraData');

  var _normalize = (0, _normalizr.normalize)(cleanData, schema),
      entities = _normalize.entities,
      result = _normalize.result;

  return {
    response: response,
    ids: result,
    entities: entities,
    // @todo: Ideally don't pass back 'data'. Needed currently for compatibility
    // with entities 'Collection' class.
    data: cleanData
  };
};

/**
 * Actually make the API request.
 *
 * @param  {object}    payload
 * @return {Generator}
 */
function makeRequest(payload) {
  var apiClient, method, uri, schemaType, itemId, associationKey, baseSchemaType, options, response, _normalizeResponse, ids, entities;

  return _regenerator2.default.wrap(function makeRequest$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          apiClient = new _index.EntitiesConfig.ApiClient({ rethrowRequestError: true });
          method = payload.method, uri = payload.uri, schemaType = payload.schemaType, itemId = payload.itemId, associationKey = payload.associationKey, baseSchemaType = payload.baseSchemaType, options = (0, _objectWithoutProperties3.default)(payload, ['method', 'uri', 'schemaType', 'itemId', 'associationKey', 'baseSchemaType']);


          if (_index.EntitiesConfig.Config.asUser) {
            options.headers = { 'As-User': _index.EntitiesConfig.Config.asUser.userId };
          }

          _context.next = 6;
          return (0, _effects.call)([apiClient, apiClient[method]], uri, options);

        case 6:
          response = _context.sent;
          _normalizeResponse = normalizeResponse(response, schemaType), ids = _normalizeResponse.ids, entities = _normalizeResponse.entities;


          if (itemId && associationKey && baseSchemaType) {
            (0, _set3.default)(entities, baseSchemaType + '.' + itemId + '.' + associationKey, ids);
          }

          if (!entities) {
            _context.next = 12;
            break;
          }

          _context.next = 12;
          return (0, _effects.put)(_actions2.default.D.mergeEntities({ entities: entities }));

        case 12:
          return _context.abrupt('return', { response: (0, _extends3.default)({}, response, { ids: ids }) });

        case 15:
          _context.prev = 15;
          _context.t0 = _context['catch'](0);

          if (!_context.t0.response) {
            // if (__DEV__) { throw error }

            /** TODO: Report errors to newrelic */
            console.error('Unexpected error in makeRequest', _context.t0);
            _context.t0.response = DUMMY_ERROR_RESPONSE;
          }

          if (isAsUserError(_context.t0.response)) {
            _index.EntitiesConfig.Config.asUser.endAsUser();
          }

          return _context.abrupt('return', { response: _context.t0.response, error: _context.t0 });

        case 20:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked, this, [[0, 15]]);
}

/**
 * Given a request description, make an API request.
 *
 * @param  {object}    payload
 * @return {Generator}
 */
function apiRequest(payload) {
  var requestId, request, requestData, _ref, response, error;

  return _regenerator2.default.wrap(function apiRequest$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          requestId = payload.requestId, request = (0, _objectWithoutProperties3.default)(payload, ['requestId']);
          requestData = { requestId: requestId, request: request };
          _context2.next = 4;
          return (0, _effects.put)(_actions2.default.D.setRequestStarted(requestData));

        case 4:
          _context2.next = 6;
          return (0, _effects.call)(makeRequest, request);

        case 6:
          _ref = _context2.sent;
          response = _ref.response;
          error = _ref.error;


          requestData.response = response;

          if (error) {
            _context2.next = 15;
            break;
          }

          _context2.next = 13;
          return (0, _effects.put)(_actions2.default.S.API_REQUEST.success(requestData));

        case 13:
          _context2.next = 17;
          break;

        case 15:
          _context2.next = 17;
          return (0, _effects.put)(_actions2.default.S.API_REQUEST.failure(requestData, error));

        case 17:
          _context2.next = 19;
          return (0, _effects.put)(_actions2.default.D.setRequestCompleted(requestData));

        case 19:
        case 'end':
          return _context2.stop();
      }
    }
  }, _marked2, this);
}

exports.default = apiRequest;