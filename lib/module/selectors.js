'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isEmpty2 = require('lodash/isEmpty');

var _isEmpty3 = _interopRequireDefault(_isEmpty2);

var _castArray2 = require('lodash/castArray');

var _castArray3 = _interopRequireDefault(_castArray2);

var _memoize2 = require('lodash/memoize');

var _memoize3 = _interopRequireDefault(_memoize2);

var _immutable = require('immutable');

var _reselect = require('reselect');

var _normalizr = require('normalizr');

var _denormalizr = require('denormalizr');

var _identity = require('./identity');

var _identity2 = _interopRequireDefault(_identity);

var _reducer = require('./reducer');

var _utils = require('./utils');

var _records = require('../records');

var _index = require('../index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Handle global state being immutable or mutable

/**
 * @description
 * An entity map, where entity records are normalized (meaning nested entities are reference ids).
 * @example
 * Map({
 *   contact: Map({
 *     contact_123: records.Contact({
 *       //...
 *       buckets: List(['bucket_123', 'bucket_456])
 *     })
 *   }),
 *   bucket: Map({
 *     bucket_123: records.Bucket({...})
 *   })
 *   //...
 * })
 */

/**
 * @example
 * Map({
 *   container1: Map({
 *     activeRequests: Set(),
 *     latestRequest: null,
 *     scope: null,
 *     filters: Map({}),
 *     ids: List([]),
 *     meta: Map({}),
 *     errors: List([])
 *   })
 * })
 */

/**
 * @description
 * Keys are stringified JSON of the request params.
 * @example
 * Map({
 *   '{"method":"get","uri":"contacts","params":{"page":1}}': Map({
 *     request: Map({
 *       associationKey: undefined,
 *       baseSchemaType: 'contact',
 *       data: undefined,
 *       itemId: undefined,
 *       method: 'get',
 *       onError: undefined,
 *       onSuccess: undefined,
 *       params: Map({}),
 *       schemaType: 'contact',
 *       tolerance: undefined,
 *       url: '/contacts'
 *     }),
 *     requestedAt: 1511741799522,
 *     respondedAt: 1511741800446,
 *     response: Map({
 *       data: Map({}),
 *       headers: Map({}),
 *       ids: List([]),
 *       meta: Map({}),
 *       request: XMLHttpRequest({}),
 *       status: 200,
 *       statusText: 'OK'
 *     })
 *   })
 * })
 */
var moduleState = function moduleState(state) {
  return state.get ? state.get(_identity2.default) : state[_identity2.default];
};


var idsFromProps = function idsFromProps(state, props) {
  return props && props.ids;
};
var typeFromProps = function typeFromProps(state, props) {
  return props && props.type;
};

/**
 * @description
 * Selects `state.entities.containers`.
 */
var containers = (0, _reselect.createSelector)(moduleState, function (state) {
  return state.get('containers');
});

/**
 * @description
 * Selects `state.entities.entities`.
 */
var entities = (0, _reselect.createSelector)(moduleState, function (state) {
  return state.get('entities');
});

/**
 * @description
 * Selects `state.entities.requests`.
 */
var requests = (0, _reselect.createSelector)(moduleState, function (state) {
  return state.get('requests');
});

/**
 * @description
 * Selects all entities of a given type.
 */
var entityItems = (0, _reselect.createSelector)(entities, typeFromProps, idsFromProps, function (entities, type, ids) {
  return _index.EntitiesConfig.schemas[type] ? (0, _denormalizr.denormalize)(ids, entities, (0, _normalizr.arrayOf)(_index.EntitiesConfig.schemas[type])) : ids;
});

/**
 * @description
 * Selects a container in the redux store.
 */
var containerState = (0, _memoize3.default)(function (containerId) {
  return (0, _reselect.createSelector)(containers, function (containers) {
    return containers.get(containerId, _reducer.initialContainerState);
  });
});

/**
 * @description
 * Selects a list of ids in a given container.
 */
var containerIds = (0, _memoize3.default)(function (containerId) {
  return (0, _reselect.createSelector)(containerState(containerId), idsFromProps, function (container, passedIds) {
    return passedIds ? (0, _immutable.fromJS)((0, _castArray3.default)(passedIds)) : container.get('ids');
  });
});

/**
 * @description
 * Selects the type of a container (e.g., 'contact' or 'bucket').
 */
var containerType = (0, _memoize3.default)(function (containerId) {
  return (0, _reselect.createSelector)(containerState(containerId), typeFromProps, function (container, passedType) {
    return passedType || container.get('type');
  });
});

/**
 * @description
 * Selects a Map of the same shape which the `entities` selector returns. However, this Map will only
 * contain entity types which pertain to the type of the given container (via `dependentEntityKeys`).
 */
var containerEntityMap = (0, _memoize3.default)(function (containerId) {
  return (0, _utils.createShallowResultSelector)(entities, containerType(containerId), function (entities, entityType) {
    return (0, _records.dependentEntityKeys)(_index.EntitiesConfig.schemas[entityType]).reduce(function (memo, dependentEntityType) {
      return memo.set(dependentEntityType, entities.get(dependentEntityType));
    }, (0, _immutable.Map)());
  });
});

/**
 * @description
 * Selects a List of denormalized entities belonging to a container.
 */
var containerItems = (0, _memoize3.default)(function (containerId) {
  return (0, _utils.createItemResultSelector)(containerEntityMap(containerId), containerIds(containerId), containerType(containerId), function (entities, ids, type) {
    return _index.EntitiesConfig.schemas[type] ? (0, _denormalizr.denormalize)(ids, entities, (0, _normalizr.arrayOf)(_index.EntitiesConfig.schemas[type])) : ids;
  });
});

/**
 * @description
 * Selects a set of ids which the container is missing.
 */
var containerMissingIds = (0, _memoize3.default)(function (containerId) {
  return (0, _reselect.createSelector)(containerIds(containerId), containerItems(containerId), function (ids, items) {
    return ids.filter(function (id, index) {
      return id && (0, _isEmpty3.default)(items.get(index));
    }).toSet();
  });
});

exports.default = {
  containers: containers,
  entities: entities,
  requests: requests,
  containerEntityMap: containerEntityMap,
  containerState: containerState,
  containerItems: containerItems,
  containerMissingIds: containerMissingIds,
  entityItems: entityItems
};