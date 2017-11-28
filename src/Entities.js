import {recordsFromFieldDefinitions} from './records'
import {schemasFromFieldDefinitions} from './schemas'

class EntitiesSingleton {
  constructor () {}

  setFieldDefinitions (fieldDefinitions, schemaDefinitions = {}) {
    this.schemas = schemasFromFieldDefinitions(fieldDefinitions, schemaDefinitions)
    this.records = recordsFromFieldDefinitions(fieldDefinitions)
  }

  setApiClient (ApiClient) {
    this.ApiClient = ApiClient
  }

  setResourceConfig (resourceConfig) {
    this.resourceConfig = resourceConfig
  }

  setConfig (Config) {
    this.Config = Config
  }
}

export default EntitiesSingleton
