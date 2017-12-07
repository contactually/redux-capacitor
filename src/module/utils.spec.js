import {Map, OrderedMap, Record, List} from 'immutable'
import {isRecord} from './utils'

describe('utils', () => {
  describe('isRecord', () => {
    test('works', () => {
      expect(isRecord(Map())).not.toBeTruthy()
      expect(isRecord(OrderedMap())).not.toBeTruthy()
      expect(isRecord(List())).not.toBeTruthy()
      const RecordFactory = Record({})
      const RecordInstance = RecordFactory({})
      expect(isRecord(RecordFactory)).not.toBeTruthy()
      expect(isRecord(RecordInstance)).toBeTruthy()
    })
  })
})
