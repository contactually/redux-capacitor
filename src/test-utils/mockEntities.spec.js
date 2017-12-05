import React from 'react'
import {mount} from 'enzyme'
jest.mock('../components/Entities')
import entities from '../components/Entities'

describe('idk', () => {
  test('what', () => {
    const Test1 = () => <div />
    const Test2 = () => <div />

    const test1Props = {
      testResource: entities.stub({
        total: 0
      })
    }
    const test2Props = {
      testResource: entities.stub({
        total: 5
      })
    }

    entities.mock(Test1.name, test1Props)
    entities.mock(Test2.name, test2Props)

    const Test1Wrapped = entities({ testResource: { type: 'contact' } })(Test1)
    const Test2Wrapped = entities({ testResource: { type: 'bucket' } })(Test2)

    const Nested = () => <div><Test2Wrapped /></div>

    const component = mount(
      <div>
        <Test1Wrapped />
        <Nested />
      </div>
    )

    expect(component.find(Test1).props()).toMatchObject(test1Props)
    expect(component.find(Test2).props()).toMatchObject(test2Props)
  })
})
