import { dependentEntityKeys, entitiesToRecords } from './records'

// todo need to define schemas here
const schemas = {}

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

    it('should be able to lookup entity by id and acccess properties', () => {
      expect(contacts.get('1').id).to.equal(1)
      expect(contacts.get('1').firstName).to.equal('Jim')
    })
  })

  describe('dependentEntityKeys', () => {
    it('includes nested schemas', () => {
      const schema = schemas.task
      const expectedKeys = [
        'task',
        'contact',
        'contactCustomField',
        'customField',
        'company',
        'location',
        'tag',
        'address',
        'bucket',
        'bucketPermission',
        'emailAddress',
        'socialMediaProfile',
        'website',
        'phoneNumber',
        'leadPool',
        'leadPoolMembership',
        'user'
      ].sort()

      expect(dependentEntityKeys(schema).sort()).to.eql(expectedKeys)
    })
  })
})
