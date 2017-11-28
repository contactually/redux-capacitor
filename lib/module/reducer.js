'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initialContainerState = exports.initialState = undefined;

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _createReducer;

var _immutable = require('immutable');

var _records = require('../records');

var _actions = require('./actions');

var _actions2 = _interopRequireDefault(_actions);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Initial module state
var initialState = (0, _immutable.fromJS)({
  containers: {},
  entities: {},
  requests: {}
});

// Initial state of a given container
var initialContainerState = (0, _immutable.fromJS)({
  activeRequests: (0, _immutable.Set)(),
  latestRequest: null,
  scope: null,
  filters: {},
  ids: [],
  meta: {},
  errors: []
});

var handleAddActiveRequest = function handleAddActiveRequest(state, _ref) {
  var containerId = _ref.containerId,
      requestId = _ref.requestId;
  return state.updateIn(['containers', containerId, 'activeRequests'], function (val) {
    return val.add(requestId);
  });
};

var handleDeleteActiveRequest = function handleDeleteActiveRequest(state, _ref2) {
  var containerId = _ref2.containerId,
      requestId = _ref2.requestId;
  return state.updateIn(['containers', containerId, 'activeRequests'], function (val) {
    return val.delete(requestId);
  }).setIn(['containers', containerId, 'latestRequest'], requestId);
};

var handleMergeContainerData = function handleMergeContainerData(state, _ref3) {
  var containerId = _ref3.containerId,
      containerData = (0, _objectWithoutProperties3.default)(_ref3, ['containerId']);
  return state.updateIn(['containers', containerId], initialContainerState, function (val) {
    return val.mergeWith(function (a, b) {
      return (0, _immutable.is)(a, b) ? a : b;
    }, containerData);
  });
};

var handleMergeFilters = function handleMergeFilters(state, _ref4) {
  var containerId = _ref4.containerId,
      filters = _ref4.filters;
  return state.mergeIn(['containers', containerId, 'filters'], filters);
};

var handleSetFilters = function handleSetFilters(state, _ref5) {
  var containerId = _ref5.containerId,
      filters = _ref5.filters;
  return state.setIn(['containers', containerId, 'filters'], (0, _immutable.fromJS)(filters));
};

var handleResetContainerData = function handleResetContainerData(state, _ref6) {
  var containerId = _ref6.containerId;
  return state.setIn(['containers', containerId], initialContainerState);
};

var handleMergeEntities = function handleMergeEntities(state, _ref7) {
  var entities = _ref7.entities;
  return state.updateIn(['entities'], function (val) {
    return (0, _records.entitiesToRecords)(val.mergeWith(_utils.safeMergeDeep, entities));
  });
};

var handleSetRequestStarted = function handleSetRequestStarted(state, _ref8) {
  var requestId = _ref8.requestId,
      rest = (0, _objectWithoutProperties3.default)(_ref8, ['requestId']);
  return state.mergeIn(['requests', requestId], (0, _extends3.default)({}, rest, { requestedAt: new Date().getTime() }));
};

var handleSetRequestCompleted = function handleSetRequestCompleted(state, _ref9) {
  var requestId = _ref9.requestId,
      rest = (0, _objectWithoutProperties3.default)(_ref9, ['requestId']);
  return state.mergeIn(['requests', requestId], (0, _extends3.default)({}, rest, { respondedAt: new Date().getTime() }));
};

exports.initialState = initialState;
exports.initialContainerState = initialContainerState;
exports.default = (0, _utils.createReducer)(initialState, (_createReducer = {}, (0, _defineProperty3.default)(_createReducer, _actions2.default.D.ADD_ACTIVE_REQUEST, handleAddActiveRequest), (0, _defineProperty3.default)(_createReducer, _actions2.default.D.DELETE_ACTIVE_REQUEST, handleDeleteActiveRequest), (0, _defineProperty3.default)(_createReducer, _actions2.default.D.MERGE_CONTAINER_DATA, handleMergeContainerData), (0, _defineProperty3.default)(_createReducer, _actions2.default.D.RESET_CONTAINER_DATA, handleResetContainerData), (0, _defineProperty3.default)(_createReducer, _actions2.default.D.MERGE_ENTITIES, handleMergeEntities), (0, _defineProperty3.default)(_createReducer, _actions2.default.D.MERGE_FILTERS, handleMergeFilters), (0, _defineProperty3.default)(_createReducer, _actions2.default.D.SET_FILTERS, handleSetFilters), (0, _defineProperty3.default)(_createReducer, _actions2.default.D.SET_REQUEST_STARTED, handleSetRequestStarted), (0, _defineProperty3.default)(_createReducer, _actions2.default.D.SET_REQUEST_COMPLETED, handleSetRequestCompleted), _createReducer));