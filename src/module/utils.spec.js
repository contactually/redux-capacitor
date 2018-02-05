import {Map, OrderedMap, Record, List} from 'immutable'
import {isRecord, normalizeResponse} from './utils'

type ApiRequestResponse = {|
  data: Object | Object[],
  headers: {},
  meta: {},
  request?: XMLHttpRequest,
  status: number,
  statusText: string
|}

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

  describe('normalizeResponse', () => {
    it('do', () => {
      const givenResponse: ApiRequestResponse = {
        data: {
          id: 'contact_123',
          firstName: 'Austin',
          buckets: [
            {
              id: 'bucket_123'
            },
            {
              id: 'bucket_456'
            }
          ]
        },
        headers: {},
        meta: {},
        status: 200,
        statusText: 'OK'
      }
      const schemaType = 'contact'
      const result = normalizeResponse(givenResponse, schemaType)
      expect(result).toMatchSnapshot()
    })
  })
})
