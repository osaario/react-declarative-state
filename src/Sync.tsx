import * as React from 'react'
import { shallowCompareInjections } from './injections'

export namespace Sync {
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

  export class PureVar<T, E extends object> extends React.Component<PureVarProps<T, E>, VarState<T>> {
    shouldComponentUpdate(nextProps: PureVarProps<T, E>, nextState: VarState<T>) {
      if (
        this.state.value === nextState.value &&
        !shallowCompareInjections(nextProps.injections, this.props.injections)
      ) {
        return false
      }
      return true
    }
    state: VarState<T> = {
      value: this.props.initialValue
    }
    setValue = (value: T) => {
      this.setState({
        value
      })
    }
    render() {
      return this.props.children(this.state.value, this.setValue, this.props.injections)
    }
  }

  export type VarProps<T> = {
    initialValue: T
    children: (value: T, setValue: (tab: T) => void) => JSX.Element
  }
  export type VarState<T> = {
    value: T
  }

  export class Var<T> extends React.Component<VarProps<T>, VarState<T>> {
    state: VarState<T> = {
      value: this.props.initialValue
    }
    setValue = (value: T) => {
      this.setState({
        value
      })
    }
    render() {
      return this.props.children(this.state.value, this.setValue)
    }
  }
}
