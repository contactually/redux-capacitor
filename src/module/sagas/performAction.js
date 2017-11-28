import _ from 'lodash'
import { fromJS, OrderedSet } from 'immutable'
import { call, put, select, take } from 'redux-saga/effects'

import { EntitiesConfig } from '../../index'

import actions from '../actions'
import selectors from '../selectors'

/**
 * Given a request description, return a unique id.
 *
 * @param  {object} request
 * @param  {string} request.method
 * @param  {string} request.uri
 * @param  {string} request.params
 * @return {string}
 */
const getRequestId = ({ method, uri, params }) => method === 'get'
  ? JSON.stringify({ method, uri, params })
  : _.uniqueId('request_')

/**
 * Returns a function to be used as the pattern for `take` which matches
 * an API request completion for a given requestId.
 *
 * @param  {string} requestId
 * @return {bool}
 */
const getResponseMatcher = (requestId) => ({ type, payload }) => (
  (type === actions.S.API_REQUEST.SUCCESS || type === actions.S.API_REQUEST.FAILURE) &&
  (payload.requestId === requestId)
)

const uriFromParts = (...parts) => _.compact(parts).join('/')

/**
 * Takes an action payload (from performAction) and returns a request
 * description.
 *
 * @param  {object} actionPayload
 * @return {object}
 */
const getRequestDescription = (actionPayload) => {
  const { type, action, scope, itemId, params, data, onSuccess, onError, tolerance } = actionPayload
  const { endpoint, actions: availableActions } = EntitiesConfig.resourceConfig[type]

  if (!availableActions || !availableActions[action]) {
    throw new Error(`Unknown action for ${type}: ${action}`)
  }

  const { method, path, schemaType = type, associationKey } = availableActions[action]

  const description = {
    method,
    uri: uriFromParts(scope, endpoint, itemId, path),
    params: _.pickBy(params, (value) => !_.isUndefined(value)),
    data,
    onSuccess,
    onError,
    schemaType,
    associationKey,
    itemId,
    tolerance,
    baseSchemaType: type
  }

  return {
    requestId: getRequestId(description),
    ...description
  }
}

/**
 * Attempts to use a cached response, otherwise triggers a request and return
 * the response. If there's already a pending request with the same requestID
 * it will not make a duplicate request.
 *
 * @param  {object}    requestDescription
 * @param  {object}    options
 * @return {Generator}
 */
function* getRequestData (requestDescription, options) {
  const { containerId, tolerance = 5000 } = options
  const { requestId } = requestDescription

  const requests = yield select(selectors.requests)
  const request = requests.get(requestId, fromJS({}))

  // If there was a previous successful response within our request tolerance
  // reuse that response.
  const hasError = request.getIn(['response', 'errors'])
  const withinTolerance = (new Date().getTime() - request.get('respondedAt', 0)) < tolerance
  if (!hasError && withinTolerance) {
    return { requestData: request.toJS() }
  }

  // If this request isn't currently pending, trigger the request.
  const pending = request.get('requestedAt', 0) > request.get('respondedAt', 0)
  if (!pending) {
    yield put(actions.S.API_REQUEST.trigger(requestDescription))
  }

  yield put(actions.D.addActiveRequest({ containerId, requestId }))

  const responseMatcher = getResponseMatcher(requestId)
  const { payload: requestData, error } = yield take(responseMatcher)

  return { requestData, error }
}

/**
 * Given a request and response, apply the given strategy to the response.
 * The strategy can be one of: ['append', 'prepend', 'ignore', 'replace', 'subtract']
 *
 * @param  {object}    givenPayload
 * @param  {object}    response
 * @return {Generator}
 */
function* applyResponseStrategy (givenPayload, response) {
  const { containerId, responseStrategy = 'replace' } = givenPayload

  // If there were no ids passed back or we're ignoring, don't return anything.
  if (!_.has(response, 'ids') || responseStrategy === 'ignore') {
    return {}
  }

  const containerState = yield select(selectors.containerState(containerId))
  const existingIds = containerState.get('ids')

  const data = { meta: response.meta }

  // Apply the given strategy
  if (responseStrategy === 'append') {
    data.ids = OrderedSet()
      .concat(existingIds)
      .concat(response.ids)
      .toList()
  } else if (responseStrategy === 'prepend') {
    data.ids = OrderedSet()
      .concat(response.ids)
      .concat(existingIds)
      .toList()
  } else if (responseStrategy === 'replace') {
    data.ids = OrderedSet(_.castArray(response.ids))
      .toList()
  } else if (responseStrategy === 'subtract') {
    data.ids = OrderedSet(existingIds)
      .subtract(_.castArray(response.ids))
      .toList()
  }

  return data
}

/**
 * Perform an action against the API.
 *
 * @param  {object}    givenPayload
 * @return {Generator}
 */
function* performAction (givenPayload) {
  const { containerId } = givenPayload

  const containerState = yield select(selectors.containerState(containerId))

  if (_.isUndefined(givenPayload.scope)) {
    givenPayload.scope = containerState.get('scope')
  }

  if (_.isUndefined(givenPayload.params)) {
    givenPayload.params = givenPayload.filters || containerState.get('filters').toJS()
  }

  const requestDescription = getRequestDescription(givenPayload)
  const { requestId } = requestDescription

  try {
    const { requestData, error } =
      yield call(getRequestData, requestDescription, givenPayload)

    let containerData

    if (!error) {
      containerData = yield call(applyResponseStrategy, givenPayload, requestData.response)
      containerData.errors = []
    } else {
      containerData = _.pick(requestData.response, 'errors')
    }

    yield put(actions.D.mergeContainerData({ containerId, ...containerData }))

    if (!error) {
      yield put(actions.S.PERFORM_ACTION.success({ containerId, ...requestData }))
    } else {
      yield put(actions.S.PERFORM_ACTION.failure({ containerId, ...requestData }, error))
    }
  } finally {
    // Ensure the active request is removed from the stack even when the saga
    // is cancelled by debouncing
    yield put(actions.D.deleteActiveRequest({ containerId, requestId }))
  }
}

export { applyResponseStrategy, getRequestData }
export default performAction
