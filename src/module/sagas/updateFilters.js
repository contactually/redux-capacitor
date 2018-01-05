import { delay } from 'redux-saga'
import { call, put } from 'redux-saga/effects'
import actions from '../actions'
import performAction from './performAction'

/**
 * Update the filters for a given container.
 *
 * @param  {object} givenPayload
 * @return {void}
 */
function* updateFilters (givenPayload = {}) {
  const {
    containerId,
    filters = {},
    debounce = true,
    resetFilters = false,
    ...rest
  } = givenPayload

  // When a filter other than the page changes, move back to the first page.
  if (!filters.page) { filters.page = 1 }

  // Merge the filters into the container
  if (resetFilters === true) {
    yield put(actions.D.setFilters({containerId, filters}))
  } else {
    yield put(actions.D.mergeFilters({containerId, filters}))
  }

  // Debounce the consecutive API request
  if (debounce) {
    yield call(delay, 400)
  }

  // Call a 'list' action with the current filters. Uses a blocking `call`
  // to ensure this request can be cancelled during debouncing since this is
  // already running async forked from `createWatcher`.
  yield call(performAction, {
    containerId,
    action: 'list',
    ...rest
  })
}

export default updateFilters
