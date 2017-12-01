import * as _ from 'lodash'
import { call, put } from 'redux-saga/effects'
import { normalize } from 'normalizr'

import { mergeKey } from '../utils'

import actions from '../actions'
import EntitiesConfig from '../../Config'

const DUMMY_ERROR_RESPONSE = {
  status: 500,
  errors: [
    'An unexpected error occurred.'
  ]
}

/**
 * Take a response and normalize the response data (if applicable).
 *
 * @param  {[type]} givenResponse [description]
 * @param  {[type]} schemaType    [description]
 * @return {[type]}               [description]
 */
const normalizeResponse = (givenResponse, schemaType) => {
  const { data, ...response } = givenResponse

  // If the response has no data key, No data needs to be merged,
  // so return an empty map.
  // TODO: For consistency this should be wrapped as an object, but there are
  // things that depend on it being unwrapped. Leaving as-is for now.
  if (_.isNil(data)) return response

  // Some resource actions return a 'job' identifier, so we filter those
  // out for now.
  if (!_.isArrayLike(data) && _.startsWith(data.id, 'job_')) return { response }

  const schema = _.isArrayLike(data)
    ? [EntitiesConfig.schemas[schemaType]]
    : EntitiesConfig.schemas[schemaType]

  const cleanData = mergeKey(data, 'extraData')

  const { entities, result } = normalize(
    cleanData,
    schema
  )

  return {
    response,
    ids: result,
    entities,
    // @todo: Ideally don't pass back 'data'. Needed currently for compatibility
    // with entities 'Collection' class.
    data: cleanData
  }
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

export {
  normalizeResponse
}
