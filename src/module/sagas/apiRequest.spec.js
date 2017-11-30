import { normalizeResponse } from './apiRequest'

type ApiRequestResponse = {|
  data: Object | Object[],
  headers: {},
  meta: {},
  request?: XMLHttpRequest,
  status: number,
  statusText: string
|}

describe('entities.sagas.apiRequest', () => {
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
