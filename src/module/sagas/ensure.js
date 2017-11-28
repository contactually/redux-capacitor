import performAction from '../sagas/performAction'
import initializeContainer from '../sagas/initializeContainer'
import selectors from '../selectors'
import { call, select } from 'redux-saga/effects'
import { List, Record, fromJS, Range } from 'immutable'
import assert from 'assert-plus'

/**
 * Fetches a list of entities
 * @param {string}  type - entity type
 * @param {object}   params  - array of ids to fetch
 * @param {object=} rest - additional params to send
 * @returns {{items: *, item: *}}
 */
export function * fetch ({ type, params, ...rest }) {
  // todo this container should be removed after we're done getting data
  const ephemeralContainerId = `fetch-${(Math.random() * 1e32).toString(36)}`

  yield call(initializeContainer, { containerId: ephemeralContainerId, type })
  yield call(performAction, {
    containerId: ephemeralContainerId,
    action: 'list',
    type,
    params,
    ...rest,
    // unfortunately, since api/v2/interactions has a `read` action,
    // but not an `index` action, we need to force entites to look at
    // the `read` action for this very specific object type :(
    itemId: type === 'interaction' ? params.id : undefined
  })
  const items = yield select(selectors.containerItems(ephemeralContainerId))

  return {
    items,
    item: items.first()
  }
}

/**
 * @param {string} type
 * @param {Array}  ids
 * @returns {List}
 */
function* selectEntityItems ({ type, ids }) {
  const response = yield select(selectors.entityItems, { type, ids: fromJS(ids) })
  return response.filter((item) => (item instanceof Record))
}

/**
 * Ensures an entity or list of entities exist in the store
 * @param {object}  options
 * @param {string}  options.type      - entity type
 * @param {object}  options.params    - additional params to send
 * @param {Array}   options.params.id - ids to fetch
 * @returns {{items: *, item: *}}
 */
export default function* ensure (options) {
  const { params, type, ...rest } = options
  assert.object(params, 'params')
  assert.array(params.id, 'params.id')
  assert.string(type, 'type')

  const existingItems = yield call(selectEntityItems, { type, ids: params.id })
  const existingIds = existingItems.map((item) => item.id)
  const missingIds = List(params.id).toSet().subtract(existingIds)

  /**
   * @yields {Array}
   * chunks the remaining missing ids into groups of 50
   * an array of fetch effects, which executes all
   * effects in parallel. see redux-saga's `all` effect
   * documentation for more info.
   */
  yield Range(0, missingIds.size, 50)
    .map((chunkStart) => missingIds.slice(chunkStart, chunkStart + 50))
    .map(
      (chunkIds) => call(fetch, { type, params: { ...params, id: chunkIds }, ...rest })
    )
    .toArray()

  const resolvedItems = yield call(selectEntityItems, { type, ids: params.id }) || List()

  return {
    items: resolvedItems,
    item: resolvedItems.first()
  }
}
