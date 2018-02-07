import { schema } from 'normalizr'
import { Record, OrderedMap, Map, fromJS } from 'immutable'
import EntitiesConfig from '../Config'
import {recordsFromFieldDefinitions} from '../records'
import {schemasFromFieldDefinitions} from '../schemas'
import {
  initialContainerState,

  handleAddActiveRequest,
  handleDeleteActiveRequest,
  handleMergeContainerData,
  handleMergeFilters,
  handleSetFilters,
  handleResetContainerData,
  handleMergeEntities,
  handlePushEntityUpdate,
  handleSetRequestStarted,
  handleSetRequestCompleted
} from './reducer'
import {fromJSOrdered} from "./utils";

describe('reducer', () => {
  describe('handleMergeContainerData', () => {
    test('resets container data', () => {
      const testContainerId = 'test-container-0099cc'
      const testContainerType = 'contact'

      const modifiedContainer = initialContainerState
        .merge({
          type: testContainerType,
          ids: fromJS(['contact_1', 'contact_2'])
        })

      const state = fromJS({
        containers: {
          [testContainerId]: modifiedContainer
        }
      })

      const result = handleResetContainerData(state, { containerId: testContainerId })
      expect(result.getIn(['containers', testContainerId, 'ids']).size).toEqual(0)
      expect(result.getIn(['containers', testContainerId, 'type'])).toEqual(testContainerType)
    })
  })

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
              /* in immutable maps with more than 8 keys, the keys will lose order, unless fromJSOrdered is used */
              columnMap: {
                'a_key': {},
                'z_key': {},
                'h_key': {},
                'b_key': {},
                'c_key': {},
                'd_key': {},
                'e_key': {},
                'aa_key': {}
              }
            }
          }
        }
      }
      const result = handleMergeEntities(state, { entities })
      const keys = result
        .getIn(['entities', 'importedCsv', 'imported_csv_123', 'importOptions', 'columnMap']).keySeq().toArray()

      expect(keys).toMatchSnapshot()
    })

    test('handles multiple merges to the same entity', () => {
      const fieldDefinitions = {
        user: {
          email: null,
          settings: Map()
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
      const entities1 = {
        contact: {
          contact_1: {
            settings: {
              enabledFeatures: ['one', 'two', 'three']
            }
          }
        }
      }
      const entities2 = {
        contact: {
          contact_1: {
            settings: {
              whatever: 'hi'
            }
          }
        }
      }

      const result1 = handleMergeEntities(state, { entities: entities1 })
      const result2 = handleMergeEntities(result1, { entities: entities2 })
      expect(result1.getIn(['entities', 'contact', 'contact_1', 'settings', 'enabledFeatures'])).toMatchSnapshot()
      expect(result2.getIn(['entities', 'contact', 'contact_1', 'settings', 'enabledFeatures'])).toMatchSnapshot()
    })
  })

  describe('handlePushEntityUpdate', () => {
    test('updates the entity in the store', () => {
      const fieldDefinitions = {
        contact: {
          firstName: null
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
      const response = {
        data: {id: 'contact_1', firstName: 'Darth'}
      }
      const schemaType = 'contact'
      const result = handlePushEntityUpdate(state, {response, schemaType})
      expect(result.getIn(['entities', 'contact', 'contact_1', 'firstName'])).toEqual('Darth')
    })
  })
})
