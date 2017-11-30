import React from 'react'
import PropTypes from 'prop-types'
import { Children, Component } from 'react'

class SagaProvider extends Component {
  static propTypes = {
    children: PropTypes.node,
    middleware: PropTypes.func.isRequired
  }

  static childContextTypes = {
    sagas: PropTypes.func.isRequired
  }

  getChildContext () {
    return {
      sagas: this.props.middleware
    }
  }
  render () {
    return Children.only(this.props.children)
  }
}

export default SagaProvider
