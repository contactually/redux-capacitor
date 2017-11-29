/* @flow */
import * as _ from 'lodash'
import { Record, fromJS, Map } from 'immutable'
import * as normalizr from 'normalizr'

import type {NormalizedEntityMap} from './module/selectors'

import EntitiesConfig from './Config'

type Records = {
  [entityName: string]: Record<{}>
}

const recordizeProperties = (memo, defaultValue, property) => {
  if (defaultValue && defaultValue.constructor === Object) {
    const NestedRecord = Record(_.reduce(defaultValue, recordizeProperties, {}))
    memo[property] = NestedRecord().mergeDeep(NestedRecord(defaultValue))
  } else {
    memo[property] = defaultValue
  }

  return memo
}

const recordsFromFieldDefinitions = (fieldDefinitions: any) => {
  return _.reduce(fieldDefinitions, (memo, properties, type) => {
    const className = _.upperFirst(type)
    const recordizedProperties = _.reduce(properties, recordizeProperties, {})

    memo[className] = Record(recordizedProperties, className)

    return memo
  }, {})
}

/**
 * @description
 * Iterates through the given normalizedEntityMap recursively, making sure that all
 * subkeys are Records.
 * @example
 * entitiesToRecords({
 *   contact: {
 *     contact_123: {id: 'contact_123', ...}
 *   },
 *   bucket: {
 *     bucket_123: {id: 'bucket_123', ...}
 *   }
 * })
 * => {
 *   contact: {
 *     contact_123: records.Contact(...)
 *   },
 *   bucket: {
 *     bucket_123: records.Bucket(...)
 *   }
 * }
 * @param {NormalizedEntityMap} normalizedEntityMap
 * @returns {NormalizedEntityMap}
 */
const entitiesToRecords = (normalizedEntityMap: NormalizedEntityMap): NormalizedEntityMap => (
  fromJS(normalizedEntityMap).withMutations(
    (entities: NormalizedEntityMap) => entities.forEach((entitiesOfType: Map<string, Record<{}>>, type: string) => {
      const RecordClass = EntitiesConfig.records[_.upperFirst(type)]

      if (!RecordClass) return

      entitiesOfType.forEach((entity, id) => {
        if (!(entity instanceof RecordClass)) {
          // $FlowFixMe
          entities.setIn([type, id], RecordClass().mergeDeep(RecordClass(entity)))
        }
      })
    })
  )
)

/**
 * @description
 * Recurses through a schema, reducing a list of all involved/nested entity types.
 * @example
 * const contact = new Schema('contact')
 * const bucket = new Schema('bucket')
 * const bucketPermission = new Schema('bucketPermission')
 *
 * contact.define({ contacts: arrayOf(contact) })
 * bucket.define({ bucketPermissions: arrayOf(bucketPermission) })
 *
 * dependentEntityKeys(contact)
 * => ['contact', 'bucket', 'bucketPermission']
 * dependentEntityKeys(bucket)
 * => ['bucket', 'bucketPermission']
 * dependentEntityKeys(bucketPermission)
 * => ['bucketPermission']
 * @param {EntitySchema} schema
 * @param {string[]=} keys
 * @returns {string[]}
 */
const dependentEntityKeys = (schema: normalizr.schema.Entity, keys: string[] = []): string[] => {
  const schemaKey = schema.key

  if (keys.includes(schemaKey)) {
    return keys
  }

  keys.push(schemaKey)

  _.each(schema.schema, (value, key) => {
    if (value instanceof normalizr.schema.Entity) {
      dependentEntityKeys(value, keys)
    } else if ((value[0] instanceof normalizr.schema.Entity)) {
      dependentEntityKeys(value[0], keys)
    }
  })

  return keys
}

export {
  dependentEntityKeys,
  entitiesToRecords,
  recordsFromFieldDefinitions
}
