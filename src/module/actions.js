import MODULE_NAME from './identity'
import { createSignalAction, createDeltaAction } from './utils'

export default {
  // Signals
  S: {
    API_REQUEST: createSignalAction(MODULE_NAME, 'API_REQUEST'),
    FETCH_ALL: createSignalAction(MODULE_NAME, 'FETCH_ALL'),
    INITIALIZE_CONTAINER: createSignalAction(MODULE_NAME, 'INITIALIZE_CONTAINER'),
    PERFORM_ACTION: createSignalAction(MODULE_NAME, 'PERFORM_ACTION'),
    UPDATE_FILTERS: createSignalAction(MODULE_NAME, 'UPDATE_FILTERS')
  },

  // Deltas
  D: {
    ...createDeltaAction(MODULE_NAME, 'ADD_ACTIVE_REQUEST'),
    ...createDeltaAction(MODULE_NAME, 'DELETE_ACTIVE_REQUEST'),
    ...createDeltaAction(MODULE_NAME, 'MERGE_ENTITIES'),
    ...createDeltaAction(MODULE_NAME, 'MERGE_FILTERS'),
    ...createDeltaAction(MODULE_NAME, 'SET_FILTERS'),
    ...createDeltaAction(MODULE_NAME, 'MERGE_CONTAINER_DATA'),
    ...createDeltaAction(MODULE_NAME, 'RESET_CONTAINER_DATA'),
    ...createDeltaAction(MODULE_NAME, 'SET_REQUEST_STARTED'),
    ...createDeltaAction(MODULE_NAME, 'SET_REQUEST_COMPLETED')
  }
}
