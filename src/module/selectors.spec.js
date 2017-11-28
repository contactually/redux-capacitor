import f from '../factories'
import { fromJS, Set } from 'immutable'

import MODULE_NAME from './identity'
import selectors from './selectors'

// Returns a function that takes a given state and determines how many
// recomputations would occur from the base state.
const getRecomputationCounter = (selector, baseState) => (...args) => {
  selector(baseState)
  selector.resetRecomputations()
  selector(...args)
  return selector.recomputations()
}

describe('selectors', () => {
  const emailAddress1 = f.create('EmailAddress')
  const emailAddress2 = f.create('EmailAddress')
  const contact = f.create('Contact', {
    emailAddresses: fromJS([emailAddress1.id, emailAddress2.id])
  })
  const contact2 = f.create('Contact', {
    emailAddresses: fromJS([emailAddress1.id, emailAddress2.id])
  })
  const task = f.create('Task', {
    title: 'Do something',
    contact: contact.id
  })

  const contactIdent = 'contact'
  const taskIdent = 'task'

  const state = fromJS({
    [MODULE_NAME]: {
      entities: {
        contact: {
          [contact.id]: contact,
          [contact2.id]: contact2
        },
        emailAddress: {
          [emailAddress1.id]: emailAddress1,
          [emailAddress2.id]: emailAddress2
        },
        task: {
          [task.id]: task
        }
      },
      containers: {
        [contactIdent]: { type: 'contact', ids: [contact.id, contact2.id] },
        [taskIdent]: { type: 'task', ids: [task.id] }
      },
      requests: {}
    }
  })

  describe('containers', () => {
    it('returns containers', () => {
      expect(selectors.containers(state)).to.eql(state.getIn([MODULE_NAME, 'containers']))
    })

    it('maintains referential equality', () => {
      const stateWithUnrelatedChange = state.setIn([MODULE_NAME, 'unrelated-key'], true)
      const stateWithRelatedChange = state.setIn([MODULE_NAME, 'containers', 'something'], true)

      // NOTE: `.to.equal` is supposed to check referential equality but
      // doesn't for some reason so we need to write the expectations this way.
      expect(selectors.containers(state) === selectors.containers(state)).to.be.true
      expect(selectors.containers(state) === selectors.containers(stateWithUnrelatedChange)).to.be.true
      expect(selectors.containers(state)).to.not.eql(selectors.containers(stateWithRelatedChange))
    })
  })

  describe('entities', () => {
    it('returns entities', () => {
      expect(selectors.entities(state)).to.eql(state.getIn([MODULE_NAME, 'entities']))
    })

    it('maintains referential equality', () => {
      const stateWithUnrelatedChange = state.setIn([MODULE_NAME, 'unrelated-key'], true)
      const stateWithRelatedChange = state.setIn([MODULE_NAME, 'entities', 'something'], true)

      // NOTE: `.to.equal` is supposed to check referential equality but
      // doesn't for some reason so we need to write the expectations this way.
      expect(selectors.entities(state) === selectors.entities(state)).to.be.true
      expect(selectors.entities(state) === selectors.entities(stateWithUnrelatedChange)).to.be.true
      expect(selectors.entities(state)).to.not.eql(selectors.entities(stateWithRelatedChange))
    })
  })

  describe('requests', () => {
    it('returns requests', () => {
      expect(selectors.requests(state)).to.eql(state.getIn([MODULE_NAME, 'requests']))
    })

    it('maintains referential equality', () => {
      const stateWithUnrelatedChange = state.setIn([MODULE_NAME, 'unrelated-key'], true)
      const stateWithRelatedChange = state.setIn([MODULE_NAME, 'requests', 'something'], true)

      // NOTE: `.to.equal` is supposed to check referential equality but
      // doesn't for some reason so we need to write the expectations this way.
      expect(selectors.requests(state) === selectors.requests(state)).to.be.true
      expect(selectors.requests(state) === selectors.requests(stateWithUnrelatedChange)).to.be.true
      expect(selectors.requests(state)).to.not.eql(selectors.requests(stateWithRelatedChange))
    })
  })

  describe('containerState', () => {
    it('returns container state', () => {
      const selector = selectors.containerState(contactIdent)

      expect(selector(state)).to.eql(state.getIn([MODULE_NAME, 'containers', contactIdent]))
    })

    it('maintains referential equality', () => {
      const selector = selectors.containerState(contactIdent)

      const stateWithUnrelatedChange = state.setIn([MODULE_NAME, 'containers', 'something'], true)
      const stateWithRelatedChange = state.setIn([MODULE_NAME, 'containers', contactIdent, 'something'], true)

      // NOTE: `.to.equal` is supposed to check referential equality but
      // doesn't for some reason so we need to write the expectations this way.
      expect(selector(state) === selector(state)).to.be.true
      expect(selector(state) === selector(stateWithUnrelatedChange)).to.be.true
      expect(selector(state)).to.not.eql(selector(stateWithRelatedChange))
    })
  })

  describe('containerItems', () => {
    const stateWithUnrelatedChange1 = state.setIn([MODULE_NAME, 'entities', 'something'], true)
    const stateWithUnrelatedChange2 = state.setIn([MODULE_NAME, 'entities', 'contact', 'xyz', 'firstName'], 'Bob')
    const stateWithRelatedChange = state.setIn([MODULE_NAME, 'entities', 'contact', contact.id, 'firstName'], 'John')

    it('returns deeply denormalized items', () => {
      const selector = selectors.containerItems(contactIdent)

      const selectedContact = selector(state).first()

      expect(selectedContact.firstName).to.eql(contact.firstName)
      expect(selectedContact.emailAddresses.first().address).to.eql(emailAddress1.address)
    })

    it('maintains referential equality', () => {
      const selector = selectors.containerItems(contactIdent)

      // NOTE: `.to.equal` is supposed to check referential equality but
      // doesn't for some reason so we need to write the expectations this way.
      expect(selector(state) === selector(state)).to.be.true
      expect(selector(state) === selector(stateWithUnrelatedChange1)).to.be.true
      expect(selector(state) === selector(stateWithUnrelatedChange2)).to.be.true
      expect(selector(state)).to.not.eql(selector(stateWithRelatedChange))
    })

    it('does not recompute unnecessarily', () => {
      const selector = selectors.containerItems(contactIdent)
      const computationsFor = getRecomputationCounter(selector, state)

      expect(computationsFor(state)).to.equal(0)
      expect(computationsFor(stateWithUnrelatedChange1)).to.equal(0)
      expect(computationsFor(stateWithUnrelatedChange2)).to.equal(1)
      expect(computationsFor(stateWithRelatedChange)).to.equal(1)
    })

    context('when an item within the collection changes', () => {
      const selector = selectors.containerItems(contactIdent)
      const stateWithContact2Change = state.setIn(
        [MODULE_NAME, 'entities', 'contact', contact2.id, 'firstName'],
        'John'
      )

      it('maintains referential equality with the unchanged item', () => {
        const changedItems = selector(stateWithContact2Change)
        const originalItems = selector(state)

        expect(selector(state) === selector(state)).to.be.true
        expect(originalItems.get(0) === changedItems.get(0)).to.be.true
        expect(originalItems.get(1) === changedItems.get(1)).to.be.false
      })
    })
  })

  describe('containerMissingIds', () => {
    const stateWithUnrelatedChange = state.setIn([MODULE_NAME, 'entities', 'contact', 'xyz'], {})
    const stateWithRelatedChange = state.removeIn([MODULE_NAME, 'entities', 'contact', contact.id])

    it('returns deeply denormalized items', () => {
      const selector = selectors.containerMissingIds(contactIdent)

      expect(selector(state)).to.eql(Set())
    })

    it('maintains referential equality', () => {
      const selector = selectors.containerMissingIds(contactIdent)

      // NOTE: `.to.equal` is supposed to check referential equality but
      // doesn't for some reason so we need to write the expectations this way.
      expect(selector(state) === selector(state)).to.be.true
      expect(selector(state) === selector(stateWithUnrelatedChange)).to.be.true
      expect(selector(state)).to.not.eql(selector(stateWithRelatedChange))
    })

    it('does not recompute unnecessarily', () => {
      const selector = selectors.containerMissingIds(contactIdent)
      const computationsFor = getRecomputationCounter(selector, state)

      expect(computationsFor(state)).to.equal(0)
      expect(computationsFor(stateWithUnrelatedChange)).to.equal(0)
      expect(computationsFor(stateWithRelatedChange)).to.equal(1)
    })
  })
})
