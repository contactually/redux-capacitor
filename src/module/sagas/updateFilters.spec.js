import { delay } from 'redux-saga'
import { call, put } from 'redux-saga/effects'

import actions from 'lib/api/module/actions'
import updateFilters from './updateFilters'
import performAction from './performAction'

describe('entities.sagas.updateFilters', () => {
  const containerId = 'contactsIndex-contact'

  context('with default params', () => {
    const payload = {
      containerId
    }
    const generator = updateFilters(payload)

    it('generates a put effect to merge filters and adds a filter for page 1 if no page filter is given', () => {
      const expectedEffect = put(actions.D.mergeFilters({
        containerId,
        filters: { page: 1 }
      }))

      expect(generator.next().value).to.eql(expectedEffect)
    })

    it('debounces consecutive API requests', () => {
      const expectedEffect = call(delay, 400)
      expect(generator.next().value).to.eql(expectedEffect)
    })

    it('generates a blocking call effect to perform the API request', () => {
      const expectedEffect = call(performAction, {
        containerId,
        action: 'list'
      })

      expect(generator.next().value).to.eql(expectedEffect)
    })
  })

  context('with custom filters and no debouncing', () => {
    const payload = {
      containerId,
      filters: { team_search: true, page: 2 },
      debounce: false
    }
    const generator = updateFilters(payload)

    it('generates a put effect to merge the given filters for the container', () => {
      const expectedEffect = put(actions.D.mergeFilters({
        containerId,
        filters: { team_search: true, page: 2 }
      }))

      expect(generator.next().value).to.eql(expectedEffect)
    })

    it('skips debouncing and generates a blocking call effect to perform the API request', () => {
      const expectedEffect = call(performAction, {
        containerId,
        action: 'list'
      })

      expect(generator.next().value).to.eql(expectedEffect)
    })
  })

  context('with resetFilters: true', () => {
    const payload = {
      containerId,
      filters: { team_search: true, page: 2 },
      resetFilters: true
    }
    const generator = updateFilters(payload)

    it('resets the filters to the passed ones', () => {
      const expectedEffect = put(actions.D.setFilters({
        containerId,
        filters: { team_search: true, page: 2 }
      }))

      expect(generator.next().value).to.eql(expectedEffect)
    })
  })

  context('with resetContainer: true', () => {
    const payload = {
      containerId,
      filters: { team_search: true, page: 2 },
      resetContainer: true
    }
    const generator = updateFilters(payload)

    it('resets the container', () => {
      const expectedEffect = put(actions.D.resetContainerData({
        containerId
      }))

      expect(generator.next().value).to.eql(expectedEffect)
    })
  })
})
