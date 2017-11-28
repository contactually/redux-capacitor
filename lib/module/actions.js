'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _identity = require('./identity');

var _identity2 = _interopRequireDefault(_identity);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  // Signals
  S: {
    API_REQUEST: (0, _utils.createSignalAction)(_identity2.default, 'API_REQUEST'),
    FETCH_ALL: (0, _utils.createSignalAction)(_identity2.default, 'FETCH_ALL'),
    INITIALIZE_CONTAINER: (0, _utils.createSignalAction)(_identity2.default, 'INITIALIZE_CONTAINER'),
    PERFORM_ACTION: (0, _utils.createSignalAction)(_identity2.default, 'PERFORM_ACTION'),
    UPDATE_FILTERS: (0, _utils.createSignalAction)(_identity2.default, 'UPDATE_FILTERS')
  },

  // Deltas
  D: (0, _extends3.default)({}, (0, _utils.createDeltaAction)(_identity2.default, 'ADD_ACTIVE_REQUEST'), (0, _utils.createDeltaAction)(_identity2.default, 'DELETE_ACTIVE_REQUEST'), (0, _utils.createDeltaAction)(_identity2.default, 'MERGE_ENTITIES'), (0, _utils.createDeltaAction)(_identity2.default, 'MERGE_FILTERS'), (0, _utils.createDeltaAction)(_identity2.default, 'SET_FILTERS'), (0, _utils.createDeltaAction)(_identity2.default, 'MERGE_CONTAINER_DATA'), (0, _utils.createDeltaAction)(_identity2.default, 'RESET_CONTAINER_DATA'), (0, _utils.createDeltaAction)(_identity2.default, 'SET_REQUEST_STARTED'), (0, _utils.createDeltaAction)(_identity2.default, 'SET_REQUEST_COMPLETED'))
};