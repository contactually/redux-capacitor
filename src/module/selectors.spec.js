import { fromJS, Set, Record } from 'immutable'

import EntitiesConfig from '../index'

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

let idIterator = 0
const createEmailAddress = (attrs) => {
  return EntitiesConfig.records.EmailAddress({
    ...attrs,
    id: `contact_identity_${idIterator++}`
  })
}
const createContact = (attrs) => {
  return EntitiesConfig.records.Contact({
    ...attrs,
    id: `contact_${idIterator++}`
  })
}
const createTask = (attrs) => {
  return EntitiesConfig.records.Task({
    ...attrs,
    id: `task_${idIterator++}`
  })
}

describe('selectors', () => {
  const emailAddress1 = createEmailAddress({})
  const emailAddress2 = createEmailAddress({})
  const contact = createContact({
    emailAddresses: fromJS([emailAddress1.id, emailAddress2.id])
  })
  const contact2 = createContact({
    emailAddresses: fromJS([emailAddress1.id, emailAddress2.id])
  })
  const task = createTask({
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
    test('returns containers', () => {
      expect(selectors.containers(state)).toMatchObject(state.getIn([MODULE_NAME, 'containers']))
    })

    test('maintains referential equality', () => {
      const stateWithUnrelatedChange = state.setIn([MODULE_NAME, 'unrelated-key'], true)
      const stateWithRelatedChange = state.setIn([MODULE_NAME, 'containers', 'something'], true)

      // NOTE: `.toEqual` is supposed to check referential equality but
      // doesn't for some reason so we need to write the expectations this way.
      expect(selectors.containers(state) === selectors.containers(state)).toBeTruthy()
      expect(selectors.containers(state) === selectors.containers(stateWithUnrelatedChange)).toBeTruthy()
      expect(selectors.containers(state)).not.toMatchObject(selectors.containers(stateWithRelatedChange))
    })
  })

  describe('entities', () => {
    test('returns entities', () => {
      expect(selectors.entities(state)).toMatchObject(state.getIn([MODULE_NAME, 'entities']))
    })

    test('maintains referential equality', () => {
      const stateWithUnrelatedChange = state.setIn([MODULE_NAME, 'unrelated-key'], true)
      const stateWithRelatedChange = state.setIn([MODULE_NAME, 'entities', 'something'], true)

      // NOTE: `.toEqual` is supposed to check referential equality but
      // doesn't for some reason so we need to write the expectations this way.
      expect(selectors.entities(state) === selectors.entities(state)).toBeTruthy()
      expect(selectors.entities(state) === selectors.entities(stateWithUnrelatedChange)).toBeTruthy()
      expect(selectors.entities(state)).not.toMatchObject(selectors.entities(stateWithRelatedChange))
    })
  })

  describe('requests', () => {
    test('returns requests', () => {
      expect(selectors.requests(state)).toMatchObject(state.getIn([MODULE_NAME, 'requests']))
    })

    test('maintains referential equality', () => {
      const stateWithUnrelatedChange = state.setIn([MODULE_NAME, 'unrelated-key'], true)
      const stateWithRelatedChange = state.setIn([MODULE_NAME, 'requests', 'something'], true)

      // NOTE: `.toEqual` is supposed to check referential equality but
      // doesn't for some reason so we need to write the expectations this way.
      expect(selectors.requests(state) === selectors.requests(state)).toBeTruthy()
      expect(selectors.requests(state) === selectors.requests(stateWithUnrelatedChange)).toBeTruthy()
      expect(selectors.requests(state)).not.toMatchObject(selectors.requests(stateWithRelatedChange))
    })
  })

  describe('containerState', () => {
    test('returns container state', () => {
      const selector = selectors.containerState(contactIdent)

      expect(selector(state)).toMatchObject(state.getIn([MODULE_NAME, 'containers', contactIdent]))
    })

    test('maintains referential equality', () => {
      const selector = selectors.containerState(contactIdent)

      const stateWithUnrelatedChange = state.setIn([MODULE_NAME, 'containers', 'something'], true)
      const stateWithRelatedChange = state.setIn([MODULE_NAME, 'containers', contactIdent, 'something'], true)

      // NOTE: `.toEqual` is supposed to check referential equality but
      // doesn't for some reason so we need to write the expectations this way.
      expect(selector(state) === selector(state)).toBeTruthy()
      expect(selector(state) === selector(stateWithUnrelatedChange)).toBeTruthy()
      expect(selector(state)).not.toMatchObject(selector(stateWithRelatedChange))
    })
  })

  describe('containerItems', () => {
    const stateWithUnrelatedChange1 = state.setIn([MODULE_NAME, 'entities', 'something'], true)
    const stateWithUnrelatedChange2 = state.setIn([MODULE_NAME, 'entities', 'contact', 'xyz', 'firstName'], 'Bob')
    const stateWithRelatedChange = state.setIn([MODULE_NAME, 'entities', 'contact', contact.id, 'firstName'], 'John')

    test('returns deeply denormalized items', () => {
      const selector = selectors.containerItems(contactIdent)

      const selectedContact = selector(state).first()

      expect(selectedContact.firstName).toEqual(contact.firstName)
      expect(selectedContact.emailAddresses.first().address).toEqual(emailAddress1.address)
    })

    test('maintains referential equality', () => {
      const selector = selectors.containerItems(contactIdent)

      // NOTE: `.toEqual` is supposed to check referential equality but
      // doesn't for some reason so we need to write the expectations this way.
      expect(selector(state) === selector(state)).toBeTruthy()
      expect(selector(state) === selector(stateWithUnrelatedChange1)).toBeTruthy()
      expect(selector(state) === selector(stateWithUnrelatedChange2)).toBeTruthy()
      expect(selector(state)).not.toMatchObject(selector(stateWithRelatedChange))
    })

    test('does not recompute unnecessarily', () => {
      const selector = selectors.containerItems(contactIdent)
      const computationsFor = getRecomputationCounter(selector, state)

      expect(computationsFor(state)).toEqual(0)
      expect(computationsFor(stateWithUnrelatedChange1)).toEqual(0)
      expect(computationsFor(stateWithUnrelatedChange2)).toEqual(1)
      expect(computationsFor(stateWithRelatedChange)).toEqual(1)
    })

    describe('when an item within the collection changes', () => {
      const selector = selectors.containerItems(contactIdent)
      const stateWithContact2Change = state.setIn(
        [MODULE_NAME, 'entities', 'contact', contact2.id, 'firstName'],
        'John'
      )

      test('maintains referential equality with the unchanged item', () => {
        const changedItems = selector(stateWithContact2Change)
        const originalItems = selector(state)

        expect(selector(state) === selector(state)).toBeTruthy()
        expect(originalItems.get(0) === changedItems.get(0)).toBeTruthy()
        expect(originalItems.get(1) === changedItems.get(1)).not.toBeTruthy()
      })
    })

    describe('when ids are missing', () => {
      test('returns an array without those items', () => {
        const selector = selectors.containerItems(contactIdent)
        const stateWithMissingIds = state
          .setIn([MODULE_NAME, 'containers', contactIdent, 'ids'], fromJS([
            'contact_123',
            'contact_1234',
            contact.id,
            contact2.id
          ]))
        const items = selector(stateWithMissingIds)
        expect(items.size).toEqual(2)
        expect(items.get(0)).toEqual(expect.any(Record))
        expect(items.get(1)).toEqual(expect.any(Record))
        expect(items.get(0).id).toEqual(contact.id)
        expect(items.get(1).id).toEqual(contact2.id)
      })
    })

    describe('when ids change', () => {
      test('returns the correct list of items', () => {
        const selector = selectors.containerItems(contactIdent)
        const stateWithIds = state
          .setIn([MODULE_NAME, 'containers', contactIdent, 'ids'], fromJS([
            contact.id,
            contact2.id
          ]))
        const stateWithoutIds = state.setIn([MODULE_NAME, 'containers', contactIdent, 'ids'], fromJS([]))

        let items
        items = selector(stateWithIds)
        expect(items.size).toEqual(2)
        items = selector(stateWithoutIds)
        expect(items.size).toEqual(0)
      })
    })
  })

  describe('containerMissingIds', () => {
    const stateWithUnrelatedChange = state.setIn([MODULE_NAME, 'entities', 'contact', 'xyz'], {})
    const stateWithRelatedChange = state.removeIn([MODULE_NAME, 'entities', 'contact', contact.id])

    test('returns deeply denormalized items', () => {
      const selector = selectors.containerMissingIds(contactIdent)

      expect(selector(state)).toMatchObject(Set())
    })

    test('maintains referential equality', () => {
      const selector = selectors.containerMissingIds(contactIdent)

      // NOTE: `.toEqual` is supposed to check referential equality but
      // doesn't for some reason so we need to write the expectations this way.
      expect(selector(state) === selector(state)).toBeTruthy()
      expect(selector(state) === selector(stateWithUnrelatedChange)).toBeTruthy()
      expect(selector(state)).not.toMatchObject(selector(stateWithRelatedChange))
    })

    test('does not recompute unnecessarily', () => {
      const selector = selectors.containerMissingIds(contactIdent)
      const computationsFor = getRecomputationCounter(selector, state)

      expect(computationsFor(state)).toEqual(0)
      expect(computationsFor(stateWithUnrelatedChange)).toEqual(0)
      expect(computationsFor(stateWithRelatedChange)).toEqual(1)
    })
  })
})
