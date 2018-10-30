import * as React from 'react'
import { shallowCompareInjections } from './injections'

export type PureScopeProps<E extends object> = {
  injections: E
  shadows?: object
  children: (injections: E) => JSX.Element
}

export class PureScope<E extends object> extends React.Component<PureScopeProps<E>> {
  shouldComponentUpdate(nextProps: PureScopeProps<E>) {
    if (!shallowCompareInjections(nextProps.injections, this.props.injections)) {
      return false
    }
    return true
  }
  render() {
    if (this.props.shadows) {
      const str = this.props.children.toString()
      const foundShadows = Object.keys(this.props.shadows).reduce((acc, shadowKey) => {
        return str.indexOf(' ' + shadowKey) !== -1 || acc
      }, false)
      if (foundShadows) {
        throw Error('Shadowed variables found in function')
      }
    }
    return this.props.children(this.props.injections)
  }
}
