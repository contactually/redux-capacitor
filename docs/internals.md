Internals (WIP)
===============

**Containers** are discretely issued to each instance of each `entities`-wrapped component.
Containers contain meta information about what the wrapped component demands. For example, it contains:
- `type` - the type of entity
- `ids` - the list of ids which belong to the current collection for that component

**Entities** is the denormalized entity store. The output is converted into an immutable object straight from normalizr.

**Requests** is the request cache. Values of this Map are request description objects, whose cache keys are generated
by `JSON.stringify`ing their request description.
For example, if I make a request to `/contacts?status=strong&q=hi`, the cache key for that request will be:
`{"uri": "contacts", "params": {"status": "strong", q: "hi"}}`.
