'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.containerPropTypes = undefined;

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _isEqual2 = require('lodash/isEqual');

var _isEqual3 = _interopRequireDefault(_isEqual2);

var _isUndefined2 = require('lodash/isUndefined');

var _isUndefined3 = _interopRequireDefault(_isUndefined2);

var _defaultTo2 = require('lodash/defaultTo');

var _defaultTo3 = _interopRequireDefault(_defaultTo2);

var _merge2 = require('lodash/merge');

var _merge3 = _interopRequireDefault(_merge2);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactImmutableProptypes = require('react-immutable-proptypes');

var _reactImmutableProptypes2 = _interopRequireDefault(_reactImmutableProptypes);

var _reactRedux = require('react-redux');

var _effects = require('redux-saga/effects');

var _module = require('../module');

var _module2 = _interopRequireDefault(_module);

var _utils = require('../module/utils');

var _Identify = require('./Identify');

var _Identify2 = _interopRequireDefault(_Identify);

var _Saga = require('./Saga');

var _Saga2 = _interopRequireDefault(_Saga);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var containerPropTypes = {
  /** Initialize the container state. */
  errors: _propTypes2.default.oneOfType([_reactImmutableProptypes2.default.list, _reactImmutableProptypes2.default.map]),

  /** Given a set of params, fetch all of the entities. */
  fetchAll: _propTypes2.default.func,

  /** Current filters. */
  filters: _reactImmutableProptypes2.default.map,

  /** Initialize the container state. */
  initialize: _propTypes2.default.func,

  /** Whether or not there has been an initial fetch. */
  isFetched: _propTypes2.default.bool,

  /** Whether or not there's an action taking place. */
  isLoading: _propTypes2.default.bool,

  /** Item referenced by the given ID. If multiple IDs, it's the first item. */
  item: _reactImmutableProptypes2.default.record,

  /** List of items referenced by the given ID(s). */
  items: _reactImmutableProptypes2.default.list,

  /** Set of ids that were requested but not available in the store. */
  missingIds: _reactImmutableProptypes2.default.set,

  /** Perform an API action against this resource. */
  performAction: _propTypes2.default.func,

  /** Total entities in a given collection. */
  total: _propTypes2.default.number,

  /** Update the filters for this container. */
  updateFilters: _propTypes2.default.func
};

var initializeContainer = function initializeContainer(props, config) {
  props.initialize({
    filters: (0, _merge3.default)({ page: 1 }, config.defaultFilters, props.defaultFilters),
    scope: (0, _defaultTo3.default)(props.scope, config.scope)
  });

  var autoload = config.preventFetch || config.preventSingletonFetch ? console.warn('preventFetch=true is deprecated, use autoload=false') || false : (0, _defaultTo3.default)(props.autoload, config.autoload);

  if ((0, _isUndefined3.default)(props.ids) && autoload !== false) {
    props.performAction({ action: 'fetch' });
  }
};

var handleFiltersChange = function handleFiltersChange(newProps, oldProps) {
  if (!(0, _isEqual3.default)(oldProps.defaultFilters, newProps.defaultFilters)) {
    newProps.updateFilters({ filters: newProps.defaultFilters });
  }
};

var handleMissingIdsChange = function handleMissingIdsChange(newProps) {
  var oldProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (newProps.missingIds === oldProps.missingIds) {
    return;
  }

  var newMissingIds = newProps.missingIds.subtract(oldProps.missingIds);

  if (newMissingIds.size) {
    newProps.fetchAll({
      params: (0, _merge3.default)({ id: newMissingIds.toArray() }, oldProps.defaultFilters),
      responseStrategy: 'ignore'
    });
  }
};

// Declare this here to keep the object reference constant
var defaultPassedIds = [];

/**
 * [entities description]
 * @param  {Object} containers
 * @param  {Object} sagas
 * @param  {String} identPrefix
 * @return {Class}
 */
function entities(containers) {
  var sagas = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var _marked = /*#__PURE__*/_regenerator2.default.mark(mountSaga),
      _marked2 = /*#__PURE__*/_regenerator2.default.mark(updateSaga);

  var identPrefix = arguments[2];

  var containerKeys = (0, _keys2.default)(containers);

  var mapState = function mapState(initialState, initialProps) {
    var selectors = containerKeys.reduce(function (memo, key) {
      var containerId = initialProps[key].containerId;


      memo[key] = {
        state: _module2.default.selectors.containerState(containerId),
        items: _module2.default.selectors.containerItems(containerId),
        missingIds: _module2.default.selectors.containerMissingIds(containerId)
      };
      return memo;
    }, {});

    // Needs to be a function so that redux will use this as the
    // mapStateToProps function on subsequent renders.
    return function (globalState, props) {
      return containerKeys.reduce(function (memo, key) {
        var containerProps = (0, _extends3.default)({}, props[key], { type: containers[key].type });
        if (containers[key].getId) {
          containerProps.ids = containers[key].getId((0, _extends3.default)({}, props, memo)) || defaultPassedIds;
        } else if (props.itemId) {
          containerProps.ids = props.itemId;
        }

        var state = selectors[key].state(globalState, containerProps);
        var items = selectors[key].items(globalState, containerProps);

        memo[key] = {
          items: items,
          missingIds: selectors[key].missingIds(globalState, containerProps),

          // Convenience helpers derived from state/items
          errors: state.get('errors'),
          item: items.first(),
          filters: state.get('filters'),
          isFetched: !!state.get('latestRequest'),
          isLoading: !!state.get('activeRequests').size,
          total: state.getIn(['meta', 'total'], 0),
          meta: state.getIn(['meta'])
        };

        return memo;
      }, {});
    };
  };

  var mapDispatch = function mapDispatch(initialDispatch, initialProps) {
    var boundActions = containerKeys.reduce(function (memo, key) {
      var defaultPayload = {
        containerId: initialProps[key].containerId,
        type: containers[key].type
      };

      memo[key] = (0, _utils.bindActionCreators)({
        fetchAll: _module2.default.actions.S.FETCH_ALL.trigger,
        initialize: _module2.default.actions.S.INITIALIZE_CONTAINER.trigger,
        performAction: _module2.default.actions.S.PERFORM_ACTION.trigger,
        updateFilters: _module2.default.actions.S.UPDATE_FILTERS.trigger
      }, initialDispatch, defaultPayload);

      // For backwards compatibility with item/collection
      var performAction = memo[key].performAction;

      memo[key].performAction = function (action) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        return typeof action === 'string' ? performAction((0, _extends3.default)({ action: action }, options)) : performAction((0, _extends3.default)({}, action, options));
      };
      memo[key].updateCollection = function () {
        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            tolerance = _ref.tolerance,
            filters = _ref.filters;

        return memo[key].updateFilters({ tolerance: tolerance, filters: filters });
      };

      return memo;
    }, {});

    // Needs to be a function so that redux will use this as the
    // mapDispatchToProps function on subsequent renders.
    return function () {
      return boundActions;
    };
  };

  var containerPropsCache = {};
  var mergeProps = function mergeProps(stateProps, dispatchProps, props) {
    return containerKeys.reduce(function (memo, key) {
      var containerId = memo[key].containerId;

      var newContainerProps = (0, _extends3.default)({}, memo[key], stateProps[key], dispatchProps[key]);

      // If the props haven't changed, return the old props object to maintain
      // referential equality.
      if (!(0, _utils.shallowEqual)(newContainerProps, containerPropsCache[containerId])) {
        containerPropsCache[containerId] = newContainerProps;
      }

      memo[key] = containerPropsCache[containerId];
      return memo;
    }, (0, _extends3.default)({}, props));
  };

  /**
   * Initializes each container and forks the configured mount saga.
   *
   * @param  {object}    props
   * @return {void}
   */
  function mountSaga(props) {
    return _regenerator2.default.wrap(function mountSaga$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _effects.fork)(sagas.mount, props);

          case 2:
          case 'end':
            return _context.stop();
        }
      }
    }, _marked, this);
  }

  /**
   * Handle prop changes and fork the configured update saga.
   *
   * @param  {object}    newProps
   * @param  {object}    oldProps
   * @return {void}
   */
  function updateSaga(newProps, oldProps) {
    return _regenerator2.default.wrap(function updateSaga$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return (0, _effects.fork)(sagas.update, newProps, oldProps);

          case 2:
          case 'end':
            return _context2.stop();
        }
      }
    }, _marked2, this);
  }

  return function wrapWithEntities(WrappedComponent) {
    var _dec, _dec2, _dec3, _class, _class2, _temp;

    var Entities = (_dec = (0, _Identify2.default)(containers, identPrefix), _dec2 = (0, _reactRedux.connect)(mapState, mapDispatch, mergeProps), _dec3 = (0, _Saga2.default)(sagas.mount && mountSaga, sagas.update && updateSaga), _dec(_class = _dec2(_class = _dec3(_class = (_temp = _class2 = function (_Component) {
      (0, _inherits3.default)(Entities, _Component);

      function Entities() {
        (0, _classCallCheck3.default)(this, Entities);
        return (0, _possibleConstructorReturn3.default)(this, (Entities.__proto__ || (0, _getPrototypeOf2.default)(Entities)).apply(this, arguments));
      }

      (0, _createClass3.default)(Entities, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
          var _this2 = this;

          containerKeys.forEach(function (key) {
            var _containers$key$fetch = containers[key].fetchMissingIds,
                fetchMissingIds = _containers$key$fetch === undefined ? true : _containers$key$fetch;

            initializeContainer(_this2.props[key], containers[key]);
            // Passing containers[key] for filters since initailize is not done yet
            if (fetchMissingIds) handleMissingIdsChange(_this2.props[key], containers[key]);
          });
        }
      }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
          var _this3 = this;

          containerKeys.forEach(function (key) {
            var _containers$key$fetch2 = containers[key].fetchMissingIds,
                fetchMissingIds = _containers$key$fetch2 === undefined ? true : _containers$key$fetch2;

            fetchMissingIds && handleMissingIdsChange(nextProps[key], _this3.props[key]);
            handleFiltersChange(nextProps[key], _this3.props[key]);
          });
        }
      }, {
        key: 'render',
        value: function render() {
          return _react2.default.createElement(WrappedComponent, this.props);
        }
      }]);
      return Entities;
    }(_react.Component), _class2.displayName = 'Entities(' + (WrappedComponent.displayName || WrappedComponent.name) + ')', _class2.WrappedComponent = WrappedComponent, _class2.propTypes = containerKeys.reduce(function (memo, key) {
      memo[key] = _propTypes2.default.shape(containerPropTypes);
      return memo;
    }, {}), _temp)) || _class) || _class) || _class);


    Entities.WrappedComponent = WrappedComponent.WrappedComponent ? WrappedComponent.WrappedComponent : WrappedComponent;

    return Entities;
  };
}

exports.containerPropTypes = containerPropTypes;
exports.default = entities;