import { schema } from 'normalizr'
import { Record, OrderedMap, Map, fromJS } from 'immutable'
import EntitiesConfig from '../Config'
import {recordsFromFieldDefinitions} from '../records'
import {schemasFromFieldDefinitions} from '../schemas'
import {
  handleAddActiveRequest,
  handleDeleteActiveRequest,
  handleMergeContainerData,
  handleMergeFilters,
  handleSetFilters,
  handleResetContainerData,
  handleMergeEntities,
  handleSetRequestStarted,
  handleSetRequestCompleted
} from './reducer'

describe('reducer', () => {
  describe('handleMergeEntities', () => {
    test('preserves order of nested maps', () => {
      const fieldDefinitions = {
        importedCsv: {
          importOptions: {
            columnMap: OrderedMap()
          }
        }
      }

      const records = recordsFromFieldDefinitions(fieldDefinitions)
      const schemas = schemasFromFieldDefinitions(fieldDefinitions)

      EntitiesConfig.configure({
        records,
        schemas
      })

      const state = Map({
        entities: Map({
          contact: Map({})
        })
      })
      const entities = {
        importedCsv: {
          imported_csv_123: {
            importOptions: {
              columnMap: {
                'fName': {
                  'skip': false,
                  'mappedHeader': 'custom_field',
                  'exampleData': [
                    'Olive',
                    'austin',
                    'who'
                  ]
                },
                'lName': {
                  'skip': false,
                  'mappedHeader': 'custom_field',
                  'exampleData': [
                    'What',
                    'When'
                  ]
                },
                'eMail': {
                  'skip': false,
                  'mappedHeader': 'custom_field',
                  'exampleData': [
                    'olivecarroll@gmail.com',
                    'bad email dawg'
                  ]
                },
                'email2': {
                  'skip': false,
                  'mappedHeader': 'email',
                  'exampleData': [
                    'olivecarroll@yahoo.com'
                  ]
                },
                'phoneNumber': {
                  'skip': false,
                  'mappedHeader': 'phone',
                  'exampleData': [
                    '(123) 456-7890',
                    '123 333 4444'
                  ]
                },
                'title': {
                  'skip': false,
                  'mappedHeader': 'title',
                  'exampleData': [
                    'CEO',
                    'idk'
                  ]
                },
                'company': {
                  'skip': false,
                  'mappedHeader': 'company',
                  'exampleData': [
                    'Canines Inc'
                  ]
                },
                'website': {
                  'skip': false,
                  'mappedHeader': 'website',
                  'exampleData': [
                    'www.olive.com'
                  ]
                },
                'homeStreet': {
                  'skip': false,
                  'mappedHeader': 'address_line_1',
                  'type': 'Home',
                  'exampleData': [
                    '123 Main Street'
                  ]
                },
                'homeCity': {
                  'skip': false,
                  'mappedHeader': 'address_city',
                  'type': 'Home',
                  'exampleData': [
                    'Arlington'
                  ]
                },
                'homeState': {
                  'skip': false,
                  'mappedHeader': 'address_state',
                  'type': 'Home',
                  'exampleData': [
                    'VA'
                  ]
                },
                'homeZip': {
                  'skip': false,
                  'mappedHeader': 'address_zip',
                  'type': 'Home',
                  'exampleData': [
                    '20001'
                  ]
                },
                'bucket': {
                  'skip': false,
                  'mappedHeader': 'buckets',
                  'exampleData': [
                    'Past Client'
                  ]
                },
                'tag': {
                  'skip': false,
                  'mappedHeader': 'tags',
                  'exampleData': [
                    'Labrador'
                  ]
                }
              }
            }
          }
        }
      }
      const result = handleMergeEntities(state, { entities })
      const keys = result
        .getIn(['entities', 'importedCsv', 'imported_csv_123', 'importOptions', 'columnMap']).keySeq().toArray()

      expect(keys).toMatchObject([
        'fName',
        'lName',
        'eMail',
        'email2',
        'phoneNumber',
        'title',
        'company',
        'website',
        'homeStreet',
        'homeCity',
        'homeState',
        'homeZip',
        'bucket',
        'tag'
      ])
    })
  })
})
