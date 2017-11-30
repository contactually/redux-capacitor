import { arrayOf } from 'normalizr'
import { List } from 'immutable'
import { EntitiesConfig } from '../../src/index'
import Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-15'

Enzyme.configure({ adapter: new Adapter() })

EntitiesConfig.setFieldDefinitions({
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
})

const baseActions = {
  list: { method: 'get' },
  create: { method: 'post' },
  fetch: { method: 'get' },
  update: { method: 'patch' },
  destroy: { method: 'delete' }
}

EntitiesConfig.setResourceConfig({
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
})

EntitiesConfig.schemas.contact.define({
  buckets: arrayOf(EntitiesConfig.schemas.bucket),
  user: EntitiesConfig.schemas.user,
  emailAddresses: arrayOf(EntitiesConfig.schemas.emailAddress)
})
EntitiesConfig.schemas.bucket.define({
  bucketPermissions: arrayOf(EntitiesConfig.schemas.bucketPermission)
})
