import {recordsFromFieldDefinitions} from './records'
import {schemasFromFieldDefinitions} from './schemas'
import EntitiesConfig from './Config'
import entities, { containerPropTypes } from './components/Entities'

export default EntitiesConfig

export {
  recordsFromFieldDefinitions,
  schemasFromFieldDefinitions,

  entities,
  containerPropTypes
}
