import * as normalizr from 'normalizr'

type Schemas = {
  [entityName: string]: Schema
}

type FieldDefinitions = {
  [entityName: string]: {
    [propertyName: string]: any
  }
}

/**
 * Creates a Schema for each of the given record types.
 */
function schemasFromFieldDefinitions (fieldDefinitions: FieldDefinitions): Schemas {
  const allSchemaTypes = Object.keys(fieldDefinitions)
  return allSchemaTypes.reduce((memo: Schemas, schemaType: string) => {
    memo[schemaType] = new normalizr.schema.Entity(schemaType)
    return memo
  }, {})
}

export {
  schemasFromFieldDefinitions
}
