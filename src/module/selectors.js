/* @flow */
import * as _ from 'lodash'
import { fromJS, Map, Record, List } from 'immutable'
import { createSelector } from 'reselect'
import { arrayOf } from 'normalizr'
import { denormalize } from 'denormalizr'

import MODULE_NAME from './identity'
import { initialContainerState } from './reducer'
import { createShallowResultSelector, createItemResultSelector } from './utils'

import { dependentEntityKeys } from '../records'
import EntitiesConfig from '../Config'

type ReduxSelectorOptions = {
  ids?: string[],
  type?: string
}
type ReduxState = Map<string, any>
type ContainerSelector<ReturnedSelector> = (containerId: string) => ReturnedSelector
type ReduxSelector<ReturnedType> = (state: Map<string, any>, options: ReduxSelectorOptions) => ReturnedType
/**
 * @description
 * An entity map, where entity records are normalized (meaning nested entities are reference ids).
 * @example
 * Map({
 *   contact: Map({
 *     contact_123: records.Contact({
 *       //...
 *       buckets: List(['bucket_123', 'bucket_456])
 *     })
 *   }),
 *   bucket: Map({
 *     bucket_123: records.Bucket({...})
 *   })
 *   //...
 * })
 */
export type NormalizedEntityMap = Map<string, Map<string, Record<any>>>
/**
 * @example
 * Map({
 *   container1: Map({
 *     activeRequests: Set(),
 *     latestRequest: null,
 *     scope: null,
 *     filters: Map({}),
 *     ids: List([]),
 *     meta: Map({}),
 *     errors: List([])
 *   })
 * })
 */
type ContainerMap = Map<string, Map<string, any>>
/**
 * @description
 * Keys are stringified JSON of the request params.
 * @example
 * Map({
 *   '{"method":"get","uri":"contacts","params":{"page":1}}': Map({
 *     request: Map({
 *       associationKey: undefined,
 *       baseSchemaType: 'contact',
 *       data: undefined,
 *       itemId: undefined,
 *       method: 'get',
 *       onError: undefined,
 *       onSuccess: undefined,
 *       params: Map({}),
 *       schemaType: 'contact',
 *       tolerance: undefined,
 *       url: '/contacts'
 *     }),
 *     requestedAt: 1511741799522,
 *     respondedAt: 1511741800446,
 *     response: Map({
 *       data: Map({}),
 *       headers: Map({}),
 *       ids: List([]),
 *       meta: Map({}),
 *       request: XMLHttpRequest({}),
 *       status: 200,
 *       statusText: 'OK'
 *     })
 *   })
 * })
 */
type RequestMap = Map<string, any>

// Handle global state being immutable or mutable
const moduleState = (state: any) => state.get
  ? state.get(MODULE_NAME)
  : state[MODULE_NAME]

const idsFromProps = (state: ReduxState, props: ReduxSelectorOptions) => props && props.ids
const typeFromProps = (state: ReduxState, props: ReduxSelectorOptions) => props && props.type

/**
 * @description
 * Selects `state.entities.containers`.
 */
const containers: ReduxSelector<ContainerMap> = createSelector(
  moduleState,
  (state) => state.get('containers')
)

/**
 * @description
 * Selects `state.entities.entities`.
 */
const entities: ReduxSelector<NormalizedEntityMap> = createSelector(
  moduleState,
  (state) => state.get('entities')
)

/**
 * @description
 * Selects `state.entities.requests`.
 */
const requests: ReduxSelector<RequestMap> = createSelector(
  moduleState,
  (state) => state.get('requests')
)

/**
 * @description
 * Selects all entities of a given type.
 */
const entityItems: ReduxSelector<List<Record<any>>> = createSelector(
  entities, typeFromProps, idsFromProps,
  (entities, type, ids) => EntitiesConfig.schemas[type]
    ? denormalize(ids, entities, arrayOf(EntitiesConfig.schemas[type]))
    : ids
)

/**
 * @description
 * Selects a container in the redux store.
 */
const containerState: ContainerSelector<ReduxSelector<ContainerMap>> = _.memoize((containerId) => createSelector(
  containers,
  (containers) => containers.get(containerId, initialContainerState)
))

/**
 * @description
 * Selects a list of ids in a given container.
 */
const containerIds: ContainerSelector<ReduxSelector<List<string>>> = _.memoize((containerId) => createSelector(
  containerState(containerId), idsFromProps,
  (container, passedIds) => passedIds
    ? fromJS(_.castArray(passedIds))
    : container.get('ids')
))

/**
 * @description
 * Selects the type of a container (e.g., 'contact' or 'bucket').
 */
const containerType: ContainerSelector<ReduxSelector<string>> = _.memoize((containerId) => createSelector(
  containerState(containerId), typeFromProps,
  (container, passedType) => passedType || container.get('type')
))

/**
 * @description
 * Selects a Map of the same shape which the `entities` selector returns. However, this Map will only
 * contain entity types which pertain to the type of the given container (via `dependentEntityKeys`).
 */
const containerEntityMap: ContainerSelector<ReduxSelector<NormalizedEntityMap>> =
_.memoize((containerId: string) => createShallowResultSelector(
  entities, containerType(containerId),
  (entities: NormalizedEntityMap, entityType: string): NormalizedEntityMap =>
    dependentEntityKeys(EntitiesConfig.schemas[entityType]).reduce(
      (memo: NormalizedEntityMap, dependentEntityType: string) =>
        memo.set(dependentEntityType, entities.get(dependentEntityType)),
      Map()
    )
))

/**
 * @description
 * Selects a List of denormalized entities belonging to a container.
 */
const containerItems: ContainerSelector<ReduxSelector<List<Record<any>>>> =
_.memoize((containerId: string) => createItemResultSelector(
  containerEntityMap(containerId), containerIds(containerId), containerType(containerId),
  (entities, ids, type) => EntitiesConfig.schemas[type]
    ? denormalize(ids, entities, arrayOf(EntitiesConfig.schemas[type]))
    : ids
))

/**
 * @description
 * Selects a set of ids which the container is missing.
 */
const containerMissingIds: ContainerSelector<ReduxSelector<List<string>>> =
_.memoize((containerId: string) => createSelector(
  containerIds(containerId), containerItems(containerId),
  (ids, items) => ids
    .filter((id, index) => id && _.isEmpty(items.get(index)))
    .toSet()
))

export default {
  containers,
  entities,
  requests,
  containerEntityMap,
  containerState,
  containerItems,
  containerMissingIds,
  entityItems
}
