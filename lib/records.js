'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.recordsFromFieldDefinitions = exports.entitiesToRecords = exports.dependentEntityKeys = undefined;

var _each2 = require('lodash/each');

var _each3 = _interopRequireDefault(_each2);

var _upperFirst2 = require('lodash/upperFirst');

var _upperFirst3 = _interopRequireDefault(_upperFirst2);

var _reduce2 = require('lodash/reduce');

var _reduce3 = _interopRequireDefault(_reduce2);

var _immutable = require('immutable');

var _IterableSchema = require('normalizr/lib/IterableSchema');

var _IterableSchema2 = _interopRequireDefault(_IterableSchema);

var _EntitySchema = require('normalizr/lib/EntitySchema');

var _EntitySchema2 = _interopRequireDefault(_EntitySchema);

var _index = require('./index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var recordizeProperties = function recordizeProperties(memo, defaultValue, property) {
  if (defaultValue && defaultValue.constructor === Object) {
    var NestedRecord = new _immutable.Record((0, _reduce3.default)(defaultValue, recordizeProperties, {}));
    memo[property] = NestedRecord().mergeDeep(NestedRecord(defaultValue));
  } else {
    memo[property] = defaultValue;
  }

  return memo;
};

var recordsFromFieldDefinitions = function recordsFromFieldDefinitions(fieldDefinitions) {
  return (0, _reduce3.default)(fieldDefinitions, function (memo, properties, type) {
    var className = (0, _upperFirst3.default)(type);
    var recordizedProperties = (0, _reduce3.default)(properties, recordizeProperties, {});

    memo[className] = new _immutable.Record(recordizedProperties, className);

    return memo;
  }, {});
};

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
var entitiesToRecords = function entitiesToRecords(normalizedEntityMap) {
  return (0, _immutable.fromJS)(normalizedEntityMap).withMutations(function (entities) {
    return entities.forEach(function (entitiesOfType, type) {
      var RecordClass = _index.EntitiesConfig.records[(0, _upperFirst3.default)(type)];

      if (!RecordClass) return;

      entitiesOfType.forEach(function (entity, id) {
        if (!(entity instanceof RecordClass)) {
          entities.setIn([type, id], RecordClass().mergeDeep(RecordClass(entity)));
        }
      });
    });
  });
};

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
var dependentEntityKeys = function dependentEntityKeys(schema) {
  var keys = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

  var schemaKey = schema.getKey();

  if (keys.includes(schemaKey)) {
    return keys;
  }

  keys.push(schemaKey);

  (0, _each3.default)(schema, function (value, key) {
    if (value instanceof _EntitySchema2.default) {
      dependentEntityKeys(value, keys);
    } else if (value instanceof _IterableSchema2.default) {
      dependentEntityKeys(value.getItemSchema(), keys);
    }
  });

  return keys;
};

exports.dependentEntityKeys = dependentEntityKeys;
exports.entitiesToRecords = entitiesToRecords;
exports.recordsFromFieldDefinitions = recordsFromFieldDefinitions;