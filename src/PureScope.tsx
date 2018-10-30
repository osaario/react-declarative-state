import * as React from 'react'
import { shallowCompareInjections } from './injections'

export type PureScopeProps<E extends object> = {
  injections: E
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
    return this.props.children(this.props.injections)
  }
}

export type PureVarProps<T, E extends object> = {
  initialValue: T
  injections: E
  children: (value: T, setValue: (tab: T) => void, injections: E) => JSX.Element
}
export type PureVarState<T> = {
  value: T
}
