import * as _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'
import { fork } from 'redux-saga/effects'

import EntitiesModule from '../module'
import { bindActionCreators, shallowEqual } from '../module/utils'

import identify from './Identify'
import saga from './Saga'

const containerPropTypes = {
  /** Initialize the container state. */
  errors: PropTypes.oneOfType([
    ImmutablePropTypes.list,
    ImmutablePropTypes.map
  ]),

  /** Given a set of params, fetch all of the entities. */
  fetchAll: PropTypes.func,

  /** Current filters. */
  filters: ImmutablePropTypes.map,

  /** Initialize the container state. */
  initialize: PropTypes.func,

  /** Whether or not there has been an initial fetch. */
  isFetched: PropTypes.bool,

  /** Whether or not there's an action taking place. */
  isLoading: PropTypes.bool,

  /** Item referenced by the given ID. If multiple IDs, it's the first item. */
  item: ImmutablePropTypes.record,

  /** List of items referenced by the given ID(s). */
  items: ImmutablePropTypes.list,

  /** Set of ids that were requested but not available in the store. */
  missingIds: ImmutablePropTypes.set,

  /** Perform an API action against this resource. */
  performAction: PropTypes.func,

  /** Total entities in a given collection. */
  total: PropTypes.number,

  /** Type of the collecton associated with resource config */
  type: PropTypes.string,

  /** Update the filters for this container. */
  updateFilters: PropTypes.func,

  /** Resets the state of this container */
  resetContainer: PropTypes.func
}

const initializeContainer = (props, config) => {
  props.initialize({
    filters: _.merge({ page: 1 }, config.defaultFilters, props.defaultFilters),
    scope: _.defaultTo(props.scope, config.scope)
  })

  const autoload = config.preventFetch || config.preventSingletonFetch
    ? (console.warn('preventFetch=true is deprecated, use autoload=false') || false)
    : _.defaultTo(props.autoload, config.autoload)

  if (_.isUndefined(props.ids) && autoload !== false) {
    props.performAction({ action: 'fetch' })
  }
}

const handleFiltersChange = (newProps, oldProps) => {
  if (!_.isEqual(oldProps.defaultFilters, newProps.defaultFilters)) {
    newProps.updateFilters({ filters: newProps.defaultFilters })
  }
}

const handleMissingIdsChange = (newProps, oldProps = {}) => {
  if (newProps.missingIds === oldProps.missingIds) {
    return
  }

  const newMissingIds = newProps.missingIds.subtract(oldProps.missingIds)

  if (newMissingIds.size) {
    newProps.fetchAll({
      params: _.merge({ id: newMissingIds.toArray() }, oldProps.defaultFilters),
      responseStrategy: 'ignore'
    })
  }
}

// Declare this here to keep the object reference constant
const defaultPassedIds = []

const createMapState = (containers, containerKeys) => (initialState, initialProps) => {
  const selectors = containerKeys.reduce((memo, key) => {
    const { containerId } = initialProps[key]

    memo[key] = {
      state: EntitiesModule.selectors.containerState(containerId),
      items: EntitiesModule.selectors.containerItems(containerId),
      missingIds: EntitiesModule.selectors.containerMissingIds(containerId)
    }
    return memo
  }, {})

  // Needs to be a function so that redux will use this as the
  // mapStateToProps function on subsequent renders.
  return (globalState, props) => containerKeys.reduce((memo, key) => {
    const containerProps = { type: containers[key].type, ...props[key] }
    if (containers[key].getId) {
      containerProps.ids = containers[key].getId({ ...props, ...memo }) || defaultPassedIds
    } else if (props.itemId) {
      containerProps.ids = props.itemId
    }

    const state = selectors[key].state(globalState, containerProps)
    const items = selectors[key].items(globalState, containerProps)

    memo[key] = {
      items,
      type: containerProps.type,
      missingIds: selectors[key].missingIds(globalState, containerProps),

      // Convenience helpers derived from state/items
      errors: state.get('errors'),
      item: items.first(),
      filters: state.get('filters'),
      isFetched: !!state.get('latestRequest'),
      isLoading: !!state.get('activeRequests').size,
      total: state.getIn(['meta', 'total'], 0),
      meta: state.getIn(['meta'])
    }

    return memo
  }, {})
}

const createMapDispatch = (containers, containerKeys) => (initialDispatch, initialProps) => {
  const boundActions = containerKeys.reduce((memo, key) => {
    const defaultPayload = {
      containerId: initialProps[key].containerId,
      type: initialProps[key].type || containers[key].type
    }

    memo[key] = bindActionCreators({
      fetchAll: EntitiesModule.actions.S.FETCH_ALL.trigger,
      initialize: EntitiesModule.actions.S.INITIALIZE_CONTAINER.trigger,
      performAction: EntitiesModule.actions.S.PERFORM_ACTION.trigger,
      updateFilters: EntitiesModule.actions.S.UPDATE_FILTERS.trigger,
      resetContainer: EntitiesModule.actions.D.resetContainerData
    }, initialDispatch, defaultPayload)

    // For backwards compatibility with item/collection
    const { performAction } = memo[key]
    memo[key].performAction =
      (action, options = {}) => typeof action === 'string'
        ? performAction({ action, ...options })
        : performAction({ ...action, ...options })
    memo[key].updateCollection = ({ tolerance, filters } = {}) => memo[key].updateFilters({ tolerance, filters })

    return memo
  }, {})

  // Needs to be a function so that redux will use this as the
  // mapDispatchToProps function on subsequent renders.
  return () => boundActions
}

/**
 * [entities description]
 * @param  {Object} containers
 * @param  {Object} sagas
 * @param  {String} identPrefix
 * @return {Class}
 */
function entities (containers, sagas = {}, identPrefix) {
  const containerKeys = Object.keys(containers)

  const mapState = createMapState(containers, containerKeys)
  const mapDispatch = createMapDispatch(containers, containerKeys)

  const containerPropsCache = {}
  const mergeProps = (stateProps, dispatchProps, props) => {
    return containerKeys.reduce((memo, key) => {
      const { containerId } = memo[key]
      const newContainerProps = { ...memo[key], ...stateProps[key], ...dispatchProps[key] }

      // If the props haven't changed, return the old props object to maintain
      // referential equality.
      if (!shallowEqual(newContainerProps, containerPropsCache[containerId])) {
        containerPropsCache[containerId] = newContainerProps
      }

      memo[key] = containerPropsCache[containerId]
      return memo
    }, { ...props })
  }

  /**
   * Initializes each container and forks the configured mount saga.
   *
   * @param  {object}    props
   * @return {void}
   */
  function* mountSaga (props) {
    yield fork(sagas.mount, props)
  }

  /**
   * Handle prop changes and fork the configured update saga.
   *
   * @param  {object}    newProps
   * @param  {object}    oldProps
   * @return {void}
   */
  function* updateSaga (newProps, oldProps) {
    yield fork(sagas.update, newProps, oldProps)
  }

  return function wrapWithEntities (WrappedComponent) {
    @identify(containers, identPrefix)
    @connect(mapState, mapDispatch, mergeProps)
    @saga(sagas.mount && mountSaga, sagas.update && updateSaga)
    class Entities extends Component {
      static displayName = `Entities(${WrappedComponent.displayName || WrappedComponent.name})`

      static WrappedComponent = WrappedComponent

      static propTypes = containerKeys.reduce((memo, key) => {
        memo[key] = PropTypes.shape(containerPropTypes)
        return memo
      }, {})

      componentDidMount () {
        containerKeys.forEach((key) => {
          const { fetchMissingIds = true } = containers[key]
          initializeContainer(this.props[key], containers[key])
          // Passing containers[key] for filters since initailize is not done yet
          if (fetchMissingIds) handleMissingIdsChange(this.props[key], containers[key])
        })
      }

      componentWillReceiveProps (nextProps) {
        containerKeys.forEach((key) => {
          const { fetchMissingIds = true } = containers[key]
          fetchMissingIds && handleMissingIdsChange(nextProps[key], this.props[key])
          handleFiltersChange(nextProps[key], this.props[key])
        })
      }

      render () {
        return <WrappedComponent {...this.props} />
      }
    }

    Entities.WrappedComponent = WrappedComponent.WrappedComponent
      ? WrappedComponent.WrappedComponent
      : WrappedComponent

    return Entities
  }
}

export {
  containerPropTypes,
  initializeContainer,
  handleFiltersChange,
  handleMissingIdsChange,
  createMapState,
  createMapDispatch
}

export default entities
