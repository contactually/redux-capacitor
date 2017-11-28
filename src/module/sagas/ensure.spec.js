import { List, Record } from 'immutable'
import ensure from './ensure'

const ContactRecord = Record({id: null})
const contactList = List((new Array(211)).fill(true).map((t, i) => {
  return ContactRecord({id: `contact_${i}`})
}))

describe('entities.sagas.ensure', () => {
  let generator
  let next
  let payload
  const requestedIds = contactList.map((contact) => contact.id).toSet()
  beforeAll(() => {
    // important: the generator must be instantiated within
    // an it, before, or beforeEach block, NOT OUTSIDE
    payload = {
      type: 'contact',
      params: {
        id: requestedIds.toArray()
      }
    }
    generator = ensure(payload)
  })

  it('tries to fetch existing entities', () => {
    generator.next() // call selectEntityItems
  })

  it('yields 5 separate requests to get 211 contacts', () => {
    next = generator.next(new List())
    expect(next.value.length).to.eq(5)
    expect(next.value[0].CALL.args[0].params.id).to.eq(requestedIds.slice(0, 50))
    expect(next.value[1].CALL.args[0].params.id).to.eq(requestedIds.slice(50, 100))
    expect(next.value[2].CALL.args[0].params.id).to.eq(requestedIds.slice(100, 150))
    expect(next.value[3].CALL.args[0].params.id).to.eq(requestedIds.slice(150, 200))
    expect(next.value[4].CALL.args[0].params.id).to.eq(requestedIds.slice(200, 211))
  })
})
