import { call, put, select } from 'redux-saga/effects'
import { Map } from 'immutable'

import selectors from '../selectors'
import actions from '../actions'
import performAction from './performAction'
import { applyResponseStrategy, getRequestData } from './performAction'

describe('entities.sagas.performAction', () => {
  const containerId = 'contactsIndex-contact'
  const containerState = Map({
    filters: Map({ page: 1 })
  })
  const payload = {
    type: 'contact',
    containerId,
    action: 'list'
  }
  const requestId = JSON.stringify({ method: 'get', uri: 'contacts', params: { page: 1 } })
  const generator = performAction(payload)

  test(
    'generates a select effect to get the container state for the containerId',
    () => {
      const expectedEffect = select(selectors.containerState(containerId))
      const next = generator.next()

      expect(next.value).toMatchObject(expectedEffect)
    }
  )

  test('generates a call effect for the requested data', () => {
    const expectedRequestDescription = {
      associationKey: undefined,
      baseSchemaType: 'contact',
      data: undefined,
      itemId: undefined,
      method: 'get',
      onError: undefined,
      onSuccess: undefined,
      params: { page: 1 },
      requestId: requestId,
      schemaType: 'contact',
      tolerance: undefined,
      uri: 'contacts'
    }
    const expectedEffect = call(getRequestData, expectedRequestDescription, payload)

    expect(generator.next(containerState).value).toMatchObject(expectedEffect)
  })

  describe('when the request is successful', () => {
    const error = false
    const requestData = {
      response: {}
    }
    const containerData = {
      items: [],
      errors: []
    }

    test(
      'generates a call effect to apply the requested response strategy',
      () => {
        const expectedEffect = call(applyResponseStrategy, payload, requestData.response)

        expect(generator.next({ requestData, error }).value).toMatchObject(expectedEffect)
      }
    )

    test(
      'generates a put effect to merge in the new data to the container data',
      () => {
        const expectedEffect = put(actions.D.mergeContainerData({ containerId, ...containerData }))

        expect(generator.next(containerData).value).toMatchObject(expectedEffect)
      }
    )

    test('generates a put effect to signal success', () => {
      const expectedEffect = put(actions.S.PERFORM_ACTION.success({ containerId, ...requestData }))

      expect(generator.next().value).toMatchObject(expectedEffect)
    })

    test('generates a put effect to delete the active request', () => {
      const expectedEffect = put(actions.D.deleteActiveRequest({ containerId, requestId }))

      expect(generator.next().value).toMatchObject(expectedEffect)
    })
  })

  describe('when the request has errors', () => {
    const error = true
    const requestData = {
      response: { errors: ['it failed'] }
    }
    const containerData = {
      errors: ['it failed']
    }
    const generator = performAction(payload)

    test(
      'generates a put effect to merge in the errors to the container data',
      () => {
        generator.next() // Skip select containerState
        generator.next(containerState) // skip call getRequestData

        const expectedEffect = put(actions.D.mergeContainerData({ containerId, ...containerData }))

        expect(generator.next({ requestData, error }).value).toMatchObject(expectedEffect)
      }
    )

    test('generates a put effect to signal failure', () => {
      const expectedEffect = put(actions.S.PERFORM_ACTION.failure({ containerId, ...requestData }, error))

      expect(generator.next().value).toMatchObject(expectedEffect)
    })

    test('generates a put effect to delete the active request', () => {
      const expectedEffect = put(actions.D.deleteActiveRequest({ containerId, requestId }))

      expect(generator.next().value).toMatchObject(expectedEffect)
    })
  })

  describe('when the saga is cancelled for debouncing', () => {
    const generator = performAction(payload)

    test('ensures the current active request is deleted', () => {
      generator.next() // select containerState
      generator.next(containerState) // call getRequestData

      const expectedEffect = put(actions.D.deleteActiveRequest({ containerId, requestId }))

      // generator.return() simulates saga cancel(task)
      // skips the put mergeContainerData and put success/failure effects
      expect(generator.return().value).toMatchObject(expectedEffect)
    })
  })
})

