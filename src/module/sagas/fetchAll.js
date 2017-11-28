import _ from 'lodash'
import { put } from 'redux-saga/effects'

import actions from '../actions'

const API_PAGINATION_LIMIT = 50

/**
 * Fetch all entities in batches.
 *
 * @param  {object} givenPayload
 * @return {void}
 */
function* fetchAll (givenPayload) {
  const { params = {}, ...rest } = givenPayload

  yield _.chunk(params.id || [], API_PAGINATION_LIMIT).map((slice) =>
    put(actions.S.PERFORM_ACTION.trigger({
      action: 'list',
      params: { ...params, id: slice },
      ...rest
    }))
  )
}

export default fetchAll
