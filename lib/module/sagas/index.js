'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _actions = require('../actions');

var _actions2 = _interopRequireDefault(_actions);

var _utils = require('../utils');

var _apiRequest = require('./apiRequest');

var _apiRequest2 = _interopRequireDefault(_apiRequest);

var _fetchAll = require('./fetchAll');

var _fetchAll2 = _interopRequireDefault(_fetchAll);

var _initializeContainer = require('./initializeContainer');

var _initializeContainer2 = _interopRequireDefault(_initializeContainer);

var _performAction = require('./performAction');

var _performAction2 = _interopRequireDefault(_performAction);

var _updateFilters = require('./updateFilters');

var _updateFilters2 = _interopRequireDefault(_updateFilters);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var sagas = [(0, _utils.createWatcher)(_actions2.default.S.API_REQUEST.TRIGGER, _apiRequest2.default), (0, _utils.createWatcher)(_actions2.default.S.FETCH_ALL.TRIGGER, _fetchAll2.default), (0, _utils.createWatcher)(_actions2.default.S.INITIALIZE_CONTAINER.TRIGGER, _initializeContainer2.default), (0, _utils.createWatcher)(_actions2.default.S.PERFORM_ACTION.TRIGGER, _performAction2.default), (0, _utils.createWatcher)(_actions2.default.S.UPDATE_FILTERS.TRIGGER, _updateFilters2.default, function (_ref) {
  var containerId = _ref.payload.containerId;
  return containerId;
})];

exports.default = (0, _utils.createRootSaga)(sagas);