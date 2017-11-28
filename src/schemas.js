import {Schema} from 'normalizr'

type Schemas = {
  [entityName: string]: Schema
}

type FieldDefinitions = {
  [entityName: string]: {
    [propertyName: string]: any
  }
}

type SchemaDefinitions = {
  [entityName: string]: {}
}

/**
 * Creates a Schema for each of the given record types.
 */
function schemasFromFieldDefinitions (fieldDefinitions: FieldDefinitions, schemaDefinitions: SchemaDefinitions): Schemas {
  const allSchemaTypes = Object.keys(fieldDefinitions).concat(Object.keys(schemaDefinitions))
  return allSchemaTypes.reduce((memo: Schemas, schemaType: string) => {
    memo[schemaType] = new Schema(schemaType, schemaDefinitions[schemaType])
    return memo
  }, {})
}

export {
  schemasFromFieldDefinitions
}
