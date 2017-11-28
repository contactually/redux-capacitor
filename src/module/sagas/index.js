import actions from '../actions'
import { createWatcher, createRootSaga } from '../utils'

import apiRequest from './apiRequest'
import fetchAll from './fetchAll'
import initializeContainer from './initializeContainer'
import performAction from './performAction'
import updateFilters from './updateFilters'

const sagas = [
  createWatcher(actions.S.API_REQUEST.TRIGGER, apiRequest),
  createWatcher(actions.S.FETCH_ALL.TRIGGER, fetchAll),
  createWatcher(actions.S.INITIALIZE_CONTAINER.TRIGGER, initializeContainer),
  createWatcher(actions.S.PERFORM_ACTION.TRIGGER, performAction),
  createWatcher(actions.S.UPDATE_FILTERS.TRIGGER, updateFilters, ({ payload: { containerId } }) => containerId)
]

export default createRootSaga(sagas)
