/* @flow */
import type {Schema} from 'normalizr'
import type {Record} from 'immutable'

type ApiRequestResponse = {
  data: Object | Object[],
  headers: {},
  meta: {},
  request?: XMLHttpRequest,
  status: number,
  statusText: string
}

type ApiRequestOptions = {
  data: {},
  headers: {}
}

type Schemas = {
  [entityType: string]: Schema
}

type Records = {
  [entityType: string]: Record<any>
}

type ApiClient = {
  ['get' | 'put' | 'post' | 'delete' | 'patch']: (uri: string, ApiRequestOptions) => Promise<ApiRequestResponse>
}

type Config = {
  asUser: {
    userId: string,
    endAsUser: () => void
  }
}

type ResourceConfig = {
  [entityType: string]: {
    endpoint: string,
    actions: {
      [actionName: string]: {
        method: string,
        path: string,
        schemaType?: string,
        associationKey?: string
      }
    }
  }
}

class EntitiesConfig {
  constructor () {}

  schemas: Schemas
  records: Records
  apiClient: ApiClient
  Config: Config
  resourceConfig: ResourceConfig

  configure (config: {|
    schemas: Schemas,
    records: Records,
    apiClient: ApiClient,
    Config: Config,
    resourceConfig: ResourceConfig
  |}): void {
    Object.assign(this, config)
  }
}

export default new EntitiesConfig()
