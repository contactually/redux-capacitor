import * as _ from 'lodash'
import { call, put } from 'redux-saga/effects'

import { mergeKey, normalizeResponse } from '../utils'

import actions from '../actions'
import EntitiesConfig from '../../Config'

const DUMMY_ERROR_RESPONSE = {
  status: 500,
  errors: [
    'An unexpected error occurred.'
  ]
}

/**
 * Actually make the API request.
 *
 * @param  {object}    payload
 * @return {Generator}
 */
function* makeRequest (payload) {
  try {
    const apiClient = EntitiesConfig.apiClient

    const { method, uri, schemaType, itemId, associationKey, baseSchemaType, ...options } = payload

    const response = yield call([apiClient, apiClient[method]], uri, options)

    const { ids, entities } = normalizeResponse(response, schemaType)

    if (itemId && associationKey && baseSchemaType) {
      _.set(entities, `${baseSchemaType}.${itemId}.${associationKey}`, ids)
    }

    if (entities) {
      yield put(actions.D.mergeEntities({ entities }))
    }

    return { response: { ...response, ids } }
  } catch (error) {
    if (!error.response) {
      // if (__DEV__) { throw error }

      /** TODO: Report errors to newrelic */
      console.error('Unexpected error in makeRequest', error)
      error.response = DUMMY_ERROR_RESPONSE
    }

    return { response: error.response, error }
  }
}

/**
 * Given a request description, make an API request.
 *
 * @param  {object}    payload
 * @return {Generator}
 */
function* apiRequest (payload) {
  const { requestId, ...request } = payload
  const requestData = { requestId, request }

  yield put(actions.D.setRequestStarted(requestData))

  const { response, error } = yield call(makeRequest, request)

  requestData.response = response

  if (!error) {
    yield put(actions.S.API_REQUEST.success(requestData))
  } else {
    yield put(actions.S.API_REQUEST.failure(requestData, error))
  }

  yield put(actions.D.setRequestCompleted(requestData))
}

export default apiRequest
