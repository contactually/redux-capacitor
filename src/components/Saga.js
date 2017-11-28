import PropTypes from 'prop-types'
import React, { Component } from 'react'

/**
 * Decorator that wraps component in Saga HOC
 *
 * @param  {Saga} mountSaga
 * @param  {Saga} updateSaga
 * @return {Component}
 */
function saga (mountSaga, updateSaga) {
  return function wrapWithSaga (WrappedComponent) {
    return class Saga extends Component {
      static displayName = `Saga(${WrappedComponent.displayName || WrappedComponent.name})`

      static contextTypes = {
        sagas: PropTypes.func.isRequired
      }

      runningSagas = []

      componentDidMount () {
        if (!this.context.sagas) {
          throw new Error('Did you forget to include <SagaProvider/>?')
        }

        if (mountSaga) {
          this.runningSagas.push(this.context.sagas.run(mountSaga, this.props))
        }
      }

      componentWillReceiveProps (nextProps) {
        if (updateSaga) {
          this.runningSagas.push(this.context.sagas.run(updateSaga, nextProps, this.props))
        }

        if (this.runningSagas.length > 100) {
          this.runningSagas = this.runningSagas.filter((saga) => saga.isRunning())
        }
      }

      componentWillUnmount () {
        this.runningSagas.forEach((saga) => saga.isRunning() && saga.cancel())
        delete this.runningSaga
      }

      render () {
        return <WrappedComponent {...this.props} />
      }
    }
  }
}

export default saga
