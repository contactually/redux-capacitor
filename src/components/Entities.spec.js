import createSagaMiddleware from 'redux-saga'
import { applyMiddleware, createStore } from 'redux'
import React from 'react'
import { Record } from 'immutable'
import { fromJS, Set, List, Map } from 'immutable'
import { Provider } from 'react-redux'
import SagaProvider from './SagaProvider'
import { mount } from 'enzyme'
import EntitiesModule from '../module'
import EntitiesConfig from '../Config'
import entities, {
  createMapState,
  createMapDispatch
} from './Entities'
import MODULE_NAME from '../module/identity'
import { omit } from 'lodash'

const ContactRecord = Record({
  id: null,
  firstName: 'first',
  lastName: 'last'
})

class MockApiClient {
  constructor () {
    this.get = jest.fn()
    this.put = jest.fn()
    this.post = jest.fn()
    this.delete = jest.fn()

    this.get.mockReturnValue(Promise.resolve({
      data: [
        { id: 'contact_1', firstName: 'Austin' },
        { id: 'contact_2', firstName: 'Test' }
      ],
      headers: {},
      meta: {
        total: 5
      },
      status: 200
    }))
  }
}

const delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

const stubRequest = (state: {}) => {
  return fromJS({}).mergeDeep(fromJS(state))
}

const stubContainer = (state) => {
  return fromJS({
    activeRequests: Set(),
    latestRequest: null,
    scope: null,
    filters: Map(),
    ids: List(),
    meta: Map(),
    errors: Map()
  }).mergeDeep(fromJS(state))
}

const stubStore = (state: {entities?: {}, containers?: {}, requests?: {}}) => {
  return fromJS({
    [MODULE_NAME]: {
      entities: {},
      containers: {},
      requests: {}
    }
  }).mergeDeep({[MODULE_NAME]: fromJS(state)})
}

describe('components.Entities', () => {
  const containers = {
    contactResource: {type: 'contact'},
    bucketResource: {type: 'bucket', autoload: false}
  }
  const containerKeys = Object.keys(containers)
  const initialState = stubStore({})
  const initialProps = {
    contactResource: {
      containerId: 'contacts-container'
    },
    bucketResource: {
      containerId: 'buckets-container'
    }
  }

  describe('integration tests', () => {
    let component
    beforeEach(() => {
      EntitiesConfig.configure({
        apiClient: new MockApiClient()
      })
      const sagaMiddleware = createSagaMiddleware()
      const store = createStore(
        (state, action) => state.set(MODULE_NAME, EntitiesModule.rootReducer(state.get(MODULE_NAME), action)),
        stubStore({}),
        applyMiddleware(sagaMiddleware)
      )
      sagaMiddleware.run(EntitiesModule.rootSaga)
      const Test = () => <div />
      const WrappedTest = entities(containers)(Test)
      component = mount(
        <SagaProvider middleware={sagaMiddleware}>
          <Provider store={store}>
            <WrappedTest />
          </Provider>
        </SagaProvider>
      )
    })

    it('renders', () => {
      expect(component.length).toEqual(1)
    })

    it('has correct props for contactResource', () => {
      const contactResourceProps = component.find('Test').at(0).prop('contactResource')
      expect(omit(contactResourceProps, ['containerId'])).toMatchSnapshot()
    })

    it('has correct props for bucketResource', () => {
      const bucketResourceProps = component.find('Test').at(0).prop('bucketResource')
      expect(omit(bucketResourceProps, ['containerId'])).toMatchSnapshot()
    })

    describe('when resetContainer is called', () => {
      test('do', () => {
        component.update()
        expect(component.find('Test').at(0).prop('contactResource').isFetched).toEqual(true)
        expect(component.find('Test').at(0).prop('contactResource').items.size).toEqual(2)
        component.find('Test').at(0).prop('contactResource').resetContainer()
        component.update()
        expect(component.find('Test').at(0).prop('contactResource').isFetched).toEqual(false)
        expect(component.find('Test').at(0).prop('contactResource').items.size).toEqual(0)
      })
    })
  })

  describe('createMapState', () => {
    it('returns a memoized function', () => {
      const mapState = createMapState(containers, containerKeys)
      const result = mapState(initialState, initialProps)
      expect(result).toEqual(expect.any(Function))
    })

    it('gets state', () => {
      const mapState = createMapState(containers, containerKeys)
      const resultFn = mapState(initialState, initialProps)
      const globalState = stubStore({
        containers: {
          'contacts-container': stubContainer({}),
          'buckets-container': stubContainer({})
        }
      })
      const props = {}
      const result = resultFn(globalState, props)
      expect(fromJS(result).toJS()).toMatchSnapshot()
    })

    it('uses passed type over container type', () => {
      const mapState = createMapState(containers, containerKeys)
      const resultFn = mapState(initialState, initialProps)
      const globalState = stubStore({
        containers: {
          'contacts-container': stubContainer({}),
          'buckets-container': stubContainer({})
        }
      })
      const props = {contactResource: {type: 'bucket'}}
      const result = resultFn(globalState, props)
      expect(result.contactResource.type).toEqual('bucket')
    })

    it('sets isLoading when a container has activeRequests', () => {
      const mapState = createMapState(containers, containerKeys)
      const resultFn = mapState(initialState, initialProps)
      const globalState = stubStore({
        containers: {
          'contacts-container': stubContainer({
            activeRequests: Set([stubRequest({})])
          }),
          'buckets-container': stubContainer({})
        }
      })
      const props = {}
      const result = resultFn(globalState, props)
      expect(result.contactResource.isLoading).toEqual(true)
      expect(result.bucketResource.isLoading).toEqual(false)
      expect(result).toMatchSnapshot()
    })

    it('sets isFetched when a container has latestRequest', () => {
      const mapState = createMapState(containers, containerKeys)
      const resultFn = mapState(initialState, initialProps)
      const globalState = stubStore({
        containers: {
          'contacts-container': stubContainer({
            latestRequest: stubRequest({})
          }),
          'buckets-container': stubContainer({})
        }
      })
      const props = {}
      const result = resultFn(globalState, props)
      expect(result.contactResource.isFetched).toEqual(true)
      expect(result.bucketResource.isFetched).toEqual(false)
      expect(result).toMatchSnapshot()
    })
  })

  describe('createMapDispatch', () => {
    const initialDispatch = jest.fn()

    it('returns a memoized function', () => {
      const mapDispatch = createMapDispatch(containers, containerKeys)
      const result = mapDispatch(initialDispatch, initialProps)
      expect(result).toEqual(expect.any(Function))
    })

    describe('binding actions', () => {
      let actions
      beforeEach(() => {
        const mapDispatch = createMapDispatch(containers, containerKeys)
        const resultFn = mapDispatch(initialDispatch, initialProps)
        actions = resultFn()
      })

      it('fetchAll', () => {
        const result = actions.contactResource.fetchAll()
        expect(initialDispatch).toBeCalled()
      })

      it('initialize', () => {
        const result = actions.contactResource.initialize()
        expect(initialDispatch).toBeCalled()
      })

      it('performAction', () => {
        const action = 'fetch'
        const options = { itemId: 'contact_123' }
        const result = actions.contactResource.performAction(action, options)
        expect(initialDispatch).toBeCalled()
        expect(initialDispatch.mock.calls[initialDispatch.mock.calls.length - 1]).toMatchSnapshot()
      })

      it('updateFilters', () => {
        const result = actions.contactResource.updateFilters()
        expect(initialDispatch).toBeCalled()
      })

      it('resetContainer', () => {
        const result = actions.contactResource.resetContainer()
        expect(initialDispatch.mock.calls[initialDispatch.mock.calls.length - 1]).toMatchSnapshot()
      })

      describe('when passed a type prop', () => {
        it('uses the passed prop over container prop', () => {
          let actions
          const mapDispatch = createMapDispatch(containers, containerKeys)
          initialProps.contactResource = {containerId: 'contacts-container', type: 'bucket'}
          const resultFn = mapDispatch(initialDispatch, initialProps)
          actions = resultFn()
          actions.contactResource.fetchAll()
          const lastMockCall = initialDispatch.mock.calls.length - 1
          expect(initialDispatch.mock.calls[lastMockCall][0].payload.type).toEqual('bucket')
        })
      })
    })
  })
})
