Internals (WIP)
===============

**Containers** are discretely issued to each instance of each `entities`-wrapped component.
Containers contain meta information about what the wrapped component demands. For example, it contains:
- `type` - the type of entity
- `ids` - the list of ids which belong to the current collection for that component

**Entities** is the denormalized entity store. The output is converted into an immutable object straight from normalizr.

**Requests** is the request cache. Values of this Map are *request description* objects, whose cache keys are generated
by `JSON.stringify`ing their request description.
For example, if I make a request to `/contacts?status=strong&q=hi`, the cache key for that request will be:
`{"uri": "contacts", "params": {"status": "strong", q: "hi"}}`.

## Terms to know

- `tolerance` the amount of time (in ms) before a request goes 'stale', and its cache is invalidated.
This globally defaults to 5000ms (5s) when not explicitly set.

##

Let's start from the beginning. Let's say you have one `entities`-wrapped component called `MyComponent`:

```js
// MyComponent.js
class MyComponent extends Component { /*...*/ }

export default (
  entities({
    contactResource: {
      type: 'contact'
    }
  })(
    MyComponent
  )
)
```

Here, you are declaring that your component, `MyComponent`, requires a resource of type 'contact'. This resource will
be given to `MyComponent` via a prop named `contactResource`.

Let's look at what happens under the hood when one `MyComponent` is mounted on the page:
1) On mount, a discrete **container** is created for this instance.
2) Capacitor attempts to provide the data that the component demands:
   - First, it builds a *request description*.
   - Then, it checks the store to see if this container has an active request.
   - Then, it checks the store to see if a request which matches the *request description* has been made within the given
   *tolerance* threshold.
   - Not finding either of these in the store, it starts a new ajax request.
   - When this ajax request completes, it normalizes entity data and merges it into the store.
   - The data is then pulled into the component via mapStateToProps.

{{TBD pretty gif image}}
