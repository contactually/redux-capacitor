import PropTypes from 'prop-types'
import _ from 'lodash'

const wrapObjectOrIds = (objectOrIds) => _.isPlainObject(objectOrIds)
  ? objectOrIds
  : { ids: objectOrIds }

/**
 * Gives the wrapped component an identity or uses the one provided by props.
 *
 * @param {object} containers
 * @param {string} identPrefix
 * @returns {function}
 */
function identify (containers, identPrefix) {
  return function wrapWithIdentify (WrappedComponent) {
    return class Identify extends React.Component {
      static displayName = `Identify(${WrappedComponent.displayName || WrappedComponent.name})`

      static propTypes = {
        ident: PropTypes.string
      }

      constructor (props) {
        super(props)

        // See: http://stackoverflow.com/a/30925561/825269)
        this.ident = identPrefix || props.ident || (Math.random() * 1e32).toString(36)
      }

      getContainerProps = () => {
        return Object.keys(containers).reduce((memo, key) => {
          const containerId = `${this.ident}-${key}`

          memo[key] = this.props[key]
            ? { containerId, ...wrapObjectOrIds(this.props[key]) }
            : { containerId }

          return memo
        }, {})
      }

      render () {
        return <WrappedComponent {...this.props} {...this.getContainerProps()} />
      }
    }
  }
}

export default identify
