import createSagaMiddleware from 'redux-saga'
import { applyMiddleware, createStore } from 'redux'
import React from 'react'
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
import { omit } from 'lodash'

class MockApiClient {
  constructor () {
    this.get = jest.fn()
    this.put = jest.fn()
    this.post = jest.fn()
    this.delete = jest.fn()

    this.get.mockReturnValue(Promise.resolve({ data: {} }))
  }
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
    entities: {
      entities: {},
      containers: {},
      requests: {}
    }
  }).mergeDeep({entities: fromJS(state)})
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

  describe('entities', () => {
    let component
    beforeEach(() => {
      EntitiesConfig.configure({
        apiClient: new MockApiClient()
      })
      const sagaMiddleware = createSagaMiddleware()
      const store = createStore(
        EntitiesModule.rootReducer,
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
    })
  })
})
