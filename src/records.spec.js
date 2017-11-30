import { dependentEntityKeys, entitiesToRecords } from './records'
import EntitiesConfig from './Config'
const { schemas } = EntitiesConfig

describe('Records', () => {
  describe('entitiesToRecords', () => {
    const input = {
      contact: {
        1: {
          id: 1,
          firstName: 'Jim'
        }
      }
    }

    const entityRecords = entitiesToRecords(input)
    const contacts = entityRecords.get('contact')

    test('should be able to lookup entity by id and acccess properties', () => {
      expect(contacts.get('1').id).toEqual(1)
      expect(contacts.get('1').firstName).toEqual('Jim')
    })
  })

  describe('dependentEntityKeys', () => {
    test('includes nested schemas', () => {
      const schema = schemas.contact
      const expectedKeys = [
        'bucket',
        'bucketPermission',
        'contact',
        'user',
        'emailAddress'
      ].sort()

      expect(dependentEntityKeys(schema).sort()).toMatchObject(expectedKeys)
    })
  })
})
