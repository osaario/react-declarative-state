import * as React from 'react'
import _ from 'lodash'
import { shallowCompareInjections } from './injections'

export type PureScopeProps<E extends object, F extends object> = {
  injections: E
  shadows?: F
  children: (injections: E, shadows: { [K in keyof F]: null }) => JSX.Element
}

export class PureScope<E extends object, F extends object> extends React.Component<PureScopeProps<E, F>> {
  shouldComponentUpdate(nextProps: PureScopeProps<E, F>) {
    if (!shallowCompareInjections(nextProps.injections, this.props.injections)) {
      return false
    }
    return true
  }
  render() {
    return this.props.children(this.props.injections, _.mapValues(this.props.shadows, () => null))
  }
}
