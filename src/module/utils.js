import * as _ from 'lodash'
import { fromJS, is, List, Map, OrderedMap, Seq } from 'immutable'
import { cancel, take, fork } from 'redux-saga/effects'
import { createSelectorCreator } from 'reselect'
import fbShallowEqual from 'fbjs/lib/shallowEqual'

/**
 * Given a type, return an "action creator" function that creates a redux
 * action of that type with the passed payload and error.
 *
 * @param  {string} type
 * @return {function}
 */
export const createActionCreator = (type) => (payload, error) => ({
  type,
  payload,
  error
})

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
export const bindActionCreators = (actions, dispatch, defaultPayload) =>
  Object.keys(actions).reduce((memo, key) => {
    memo[key] = (payload) => {
      const actionPayload = defaultPayload && payload
        ? { ...defaultPayload, ...payload }
        : defaultPayload || payload

      return dispatch(actions[key](actionPayload))
    }
    return memo
  }, {})

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
export const createSignalAction = (reducerName, actionName) => (
  ['TRIGGER', 'SUCCESS', 'FAILURE'].reduce((memo, type, index) => {
    memo[type] = `S/${reducerName}/${actionName}/${type}`
    memo[_.camelCase(type)] = createActionCreator(memo[type])
    return memo
  }, {})
)

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
export const createDeltaAction = (reducerName, actionName) => {
  const type = `D/${reducerName}/${actionName}`

  return {
    [actionName]: type,
    [_.camelCase(actionName)]: createActionCreator(type)
  }
}

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
export const createWatcher = (pattern, fn, resolver) => {
  return function* () {
    const tasks = {}

    while (true) {
      const action = yield take(pattern)
      const taskId = resolver && resolver(action)

      if (resolver && tasks[taskId]) {
        yield cancel(tasks[taskId])
      }

      tasks[taskId] = yield fork(fn, action.payload, action.error, action.type)
    }
  }
}

/**
 * Given an array of generator functions, return one function that forks all
 * of them.
 *
 * @param  {array} sagas
 * @return {Generator}
 */
export const createRootSaga = (sagas) => {
  return function* (...args) {
    yield sagas.map((saga) => fork(saga, ...args))
  }
}

/**
 * Expects a map of redux action type to handler. The handler should be a
 * function that returns a new state given the old state and action payload.
 * If no handler is found for a given action, the old state is returned.
 *
 * @param  {any} initialState
 * @param  {object} handlers
 * @return {function}
 */
export const createReducer = (initialState, handlers) =>
  (state = initialState, { type, payload, error }) => (
    handlers[type]
      ? handlers[type](state, payload, error)
      : state
  )

/**
 * By default, fromJS will use unordered Maps to build nested objects
 * This method uses OrderedMaps instead, to preserve key order.
 * @param {object|array} js
 * @returns {List|Map}
 */
export const fromJSOrdered = (js) => {
  return typeof js !== 'object' || js === null ? js :
    Array.isArray(js) ?
      Seq(js).map(fromJSOrdered).toList() :
      Seq(js).map(fromJSOrdered).toOrderedMap();
}

const isList = List.isList
const isMap = Map.isMap
const isObject = _.isObject
const isRecord = (a) => a && isMap(a._map) // There's no built-in `isRecord` :|

/**
 * Custom 'merger' function for use with Immutable `mergeWith` that manually
 * merges records to prevent raising errors when there are unknown keys.
 *
 * @param  {any} a
 * @param  {any} b
 * @return {any}
 */
export const safeMergeDeep = (a, b) => {
  if (isRecord(a) && isObject(b)) {
    // Based on merge functionality in Map which record inherits:
    // https://github.com/facebook/immutable-js/blob/master/src/Map.js#L756-L778
    return a.withMutations(
      (record) => fromJS(b).forEach(
        (value, key) => {
          // The `record.has` check ensures we don't try setting keys that
          // don't exist on the record.
          // The `is` check is a bit more complicated. For immutable maps and
          // records, when using set or merge if nothing actually changed it
          // will try to return the same reference. Without this check, if
          // the value here is a non-primitive calling set will still cause
          // the record's reference to change. So to prevent that, we use
          // a deeper equals check.
          if (record.has(key) && !is(record.get(key), value)) {
            record.set(key, value)
          }
        }
      )
    )
  }

  return (a && a.mergeWith && !isList(a) && !isList(b))
    ? a.mergeWith(safeMergeDeep, b)
    : b
}

/**
 * Performs an efficient shallow equality of two things.
 *
 * @return {boolean}
 */
export const shallowEqual = fbShallowEqual

/* eslint-disable no-self-compare */
/**
 * Mix of shallowEqual and Immutable.is.
 *
 * @param  {any} valueA
 * @param  {any} valueB
 * @return {boolean}
 */
export const immutableShallowEqual = (valueA, valueB) => {
  if (valueA === valueB || (valueA !== valueA && valueB !== valueB)) {
    return true
  }
  if (!valueA || !valueB) {
    return false
  }
  if (typeof valueA.valueOf === 'function' &&
      typeof valueB.valueOf === 'function') {
    valueA = valueA.valueOf()
    valueB = valueB.valueOf()
    if (valueA === valueB || (valueA !== valueA && valueB !== valueB)) {
      return true
    }
    if (!valueA || !valueB) {
      return false
    }
  }
  // Instead of recursively/deeply comparing valueA and valueB, shallowly
  // compare the key/values one level deep.
  if (typeof valueA.get === 'function' &&
      typeof valueB.get === 'function' &&
      valueA.size === valueB.size) {
    return valueA.every((value, key) => valueB.get(key) === value)
  }
  return false
}
/* eslint-enable no-self-compare */

// This is just defaultMemoize from `reselect` with a small tweak exlained
// in a comment inline.
const resultEqualityMemoize = (func, resultEqualityCheck = shallowEqual) => {
  let lastArgs = null
  let lastResult = null
  const isEqualToLastArg = (value, index) => value === lastArgs[index]
  return (...args) => {
    if (
      lastArgs === null ||
      lastArgs.length !== args.length ||
      !args.every(isEqualToLastArg)
    ) {
      const newResult = func(...args)

      // In default memoize, lastResult is always set to the computed value.
      // This performs a deep equality check which is a little more expensive
      // but ensures that if the result does not actually change referential
      // equality is maintained. This is a tradeoff to make equality checks
      // faster at the component level.
      if (!resultEqualityCheck(newResult, lastResult)) { lastResult = newResult }
    }
    lastArgs = args
    return lastResult
  }
}

const toItemSet = (itemList) => {
  return itemList.reduce((memo, item = {}) => { return memo.set(item.id, item) }, OrderedMap())
}

const diffItems = (lastItemSet, newResultSet) => {
  return newResultSet.size > 0
    ? newResultSet.mergeWith((newItem, lastItem, key) => {
      return is(lastItem, newItem) ? lastItem : newItem
    }, lastItemSet)
      .filter((_, key) => newResultSet.get(key))
      .toList()
    : List()
}

// This is just defaultMemoize from `reselect` with a small tweak exlained
// in a comment inline.
const resultItemEqualityMemoize = (func, resultEqualityCheck = shallowEqual) => {
  let lastArgs = null
  let lastResult = null
  let lastItemSet = null
  const isEqualToLastArg = (value, index) => value === lastArgs[index]
  return (...args) => {
    if (
      lastArgs === null ||
      lastArgs.length !== args.length ||
      !args.every(isEqualToLastArg)
    ) {
      const newResult = func(...args)
      if (!lastResult) {
        lastResult = newResult
        lastItemSet = toItemSet(newResult)
      } else if (!resultEqualityCheck(newResult, lastResult)) {
        const newResultSet = toItemSet(newResult)
        lastResult = diffItems(lastItemSet, newResultSet)
        lastItemSet = newResultSet
      }
    }

    lastArgs = args
    return lastResult
  }
}

/**
 * Recursively merges key into the containing object.
 *
 * @param {object|array} input - e.g. contact
 * @param {string} key
 * @returns {object|array} Object or Array with merged keys
 */
export function mergeKey (input, key) {
  const merge = (object) => mergeKey(object, key)

  if (_.isArray(input)) {
    return input.map(merge)
  } else if (_.isObject(input)) {
    const object = _.reduce(input, (result, value, objectKey) => {
      result[objectKey] = merge(value)
      return result
    }, {})

    return object[key]
      ? _.merge(_.omit(object, key), object[key])
      : object
  } else {
    return input
  }
}

export const createShallowResultSelector = createSelectorCreator(resultEqualityMemoize, immutableShallowEqual)
export const createItemResultSelector = createSelectorCreator(resultItemEqualityMemoize, is)
