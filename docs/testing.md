Testing
=======

## Philosophy

This document details our core principles on testing `entities`-wrapped components.

We offer a variety of methods of testing `entities`-wrapped components. The least obtrusive way is
to use the [WrappedComponent Method](#wrappedcomponent-method).

### Unwrapped Components

#### WrappedComponent Method

All `entities`-wrapped components have a `WrappedComponent` property, which is a reference
to the unwrapped component:

```js
// MyComponent.js
class MyComponent extends Component {
  /* ... */
}

export (
  entities({})(
    MyComponent
  )
)
```

```js
// MyComponent.spec.js
import { mount } from 'enzyme'
import MyComponent from './MyComponent'
import { entities } from 'redux-capacitor'

const contacts = List([
  ContactRecord({id: 1}),
  ContactRecord({id: 2}),
  ContactRecord({id: 3})
])
const defaultProps = {
  contactResource: entities.entityStub({
    items: contacts
  })
}

describe('MyComponent', () => {
  test('renders 3 rows', () => {
    const component = mount(MyComponent.WrappedComponent, defaultProps)
    /* do stuff */
  })
})
```

#### Export Method

A convention that we've found successful (but not necessary) is to export an unwrapped version
of your component, before applying the `entities` HOC:

```js
// MyComponent.js
class MyComponent extends Component {
  /* ... */
}

export { MyComponent }

export (
  entities({ contactResource: { type: 'contact' } })(
    MyComponent
  )
)
```

This allows you to import the unwrapped, named export in your tests:

```js
// MyComponent.spec.js
import { mount } from 'enzyme'
import { MyComponent } from './MyComponent'
import { entities } from 'redux-capacitor'

const contacts = List([
  ContactRecord({id: 1}),
  ContactRecord({id: 2}),
  ContactRecord({id: 3})
])
const defaultProps = {
  contactResource: entities.entityStub({
    items: contacts
  })
}

describe('MyComponent', () => {
  test('renders 3 rows', () => {
    const component = mount(MyComponent, defaultProps)
    /* do stuff */
  })
})
```

### Nested Wrapped Components

#### Mock Method

Building on the examples above, let's say you have a component which renders
a few wrapped `<MyComponent />` elements.

```js
// AnotherComponent.js
import MyComponent from 'components/MyComponent'

class MyComponent extends Component {
  render () {
    return (
      <div>
        <h1>Some stuff!</h1>
        <div>
          <MyComponent />
        </div>
        <MyComponent />
      </div>
    )
  }
}
```

If you must `mount` `AnotherComponent` in your test, then you can use `redux-capacitor`'s built-in
test mock to stub out the `entities` HOC.

{{Section TBD}}

#### Dive Method

Although we provide a fully functional mock for components wrapped with the `entities` HOC, enzyme still
recommends shallow rendering redux-connected components and using `.dive` to make sure the
correct props are passed to child components.

https://github.com/airbnb/enzyme/issues/98#issuecomment-279181813
