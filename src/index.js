import entities from './components/Entities'

import EntitiesSingleton from './Entities'

const EntitiesConfig = new EntitiesSingleton()

export {
  EntitiesConfig,
  entities
}
