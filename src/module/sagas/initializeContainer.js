import { put, select } from 'redux-saga/effects'

import actions from '../actions'
import selectors from '../selectors'

/**
 * Initialize a given container.
 *
 * @param  {object} givenPayload
 * @return {void}
 */
function* initializeContainer (givenPayload) {
  const { containerId } = givenPayload

  const oldContainerState = yield select(selectors.containerState(containerId))
  const newContainerState = oldContainerState.merge(givenPayload).toObject()

  yield put(actions.D.mergeContainerData(newContainerState))
  yield put(actions.S.INITIALIZE_CONTAINER.success(newContainerState))
}

export default initializeContainer
