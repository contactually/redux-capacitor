import { arrayOf } from 'normalizr'
import { List } from 'immutable'
import EntitiesConfig, {
  recordsFromFieldDefinitions,
  schemasFromFieldDefinitions
} from '../../src/index'
import Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-15'

Enzyme.configure({ adapter: new Adapter() })

const fieldDefinitions = {
  contact: {
    id: null,
    firstName: null,
    buckets: List(),
    user: null,
    emailAddresses: List()
  },
  user: {
    id: null,
    email: null
  },
  bucket: {
    id: null,
    name: null,
    bucketPermission: List()
  },
  bucketPermission: {
    id: null
  },
  emailAddress: {
    id: null,
    address: null
  },
  task: {
    id: null
  }
}

const schemas = schemasFromFieldDefinitions(fieldDefinitions)

schemas.contact.define({
  buckets: arrayOf(schemas.bucket),
  user: schemas.user,
  emailAddresses: arrayOf(schemas.emailAddress)
})
schemas.bucket.define({
  bucketPermissions: arrayOf(schemas.bucketPermission)
})

const records = recordsFromFieldDefinitions(fieldDefinitions)

const baseActions = {
  list: { method: 'get' },
  create: { method: 'post' },
  fetch: { method: 'get' },
  update: { method: 'patch' },
  destroy: { method: 'delete' }
}

const resourceConfig = {
  contact: {
    endpoint: 'contacts',
    actions: {
      ...baseActions
    }
  },
  bucket: {
    endpoint: {
      endpoint: 'buckets',
      actions: {
        ...baseActions
      }
    }
  }
}

EntitiesConfig.configure({
  schemas,
  records,
  resourceConfig
})
