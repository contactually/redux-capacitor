import type {ComponentType} from 'react'
import React, {Component} from 'react'
import {List, Map, Set} from 'immutable'
import _ from 'lodash'

const mockFn = (() => {
  if (typeof jest !== 'undefined' && jest.fn) {
    return jest.fn
  } else if (typeof sinon !== 'undefined' && sinon.spy) {
    return sinon.spy
  } else {
    return _.noop
  }
})()

let stubs = {}
const mockEntities = (config: {}, options: {}) => (WrappedComponent: ComponentType<any>): ComponentType<any> => {
  return class MockEntities extends Component<any> {
    render() {
      const props = stubs[WrappedComponent.name] || {}
      return <WrappedComponent {...this.props} {...props} />
    }
  }
}

mockEntities.reset = () => stubs = {}
mockEntities.mock = (ComponentName, props) => {
  stubs[ComponentName] = props
}
mockEntities.stub = (options) => {
  return {
    /** Empty List or Map of errors returned from server */
    errors: options.errors || new List([]),

    /** Given a set of params, fetch all of the entities. */
    fetchAll: options.fetchAll || mockFn(),

    /** Current filters. */
    filters: options.filters || Map(),

    /** Initialize the container state. */
    initialize: options.initialize || mockFn(),

    /** Whether or not there has been an initial fetch. */
    isFetched: 'isFetched' in options ? options.isFetched : true,

    /** Whether or not there's an action taking place. */
    isLoading: 'isLoading' in options ? options.isLoading : false,

    /** Item referenced by the given ID. If multiple IDs, it's the first item. */
    item: options.item || null,

    /** List of items referenced by the given ID(s). */
    items: options.items || List(),

    /** Meta data about the collection. Usually pagination. */
    meta: options.meta || Map(),

    /** Set of ids that were requested but not available in the store. */
    missingIds: options.missingIds || Set(),

    /** Perform an API action against this resource. */
    performAction: options.performAction || mockFn(),

    /** Total entities in a given collection. */
    total: options.total || 0,

    /** Update the filters for this container. */
    updateFilters: options.updateFilters || mockFn(),

    /** Update the filters for this container. Uses existing filters. */
    updateCollection: options.updateCollection || mockFn()
  }
}

export default mockEntities
