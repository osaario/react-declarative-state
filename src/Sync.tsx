import * as React from 'react'

export namespace Sync {
  export type PureVarProps<T, E> = {
    initialValue: T
    injection: E
    children: (value: T, setValue: (tab: T) => void, injection: E) => JSX.Element
  }
  export type PureVarState<T> = {
    value: T
  }

  export class PureVar<T, E> extends React.Component<PureVarProps<T, E>, VarState<T>> {
    shouldComponentUpdate(nextProps: PureVarProps<T, E>, nextState: VarState<T>) {
      if (this.state.value === nextState.value && this.props.injection === nextProps.injection) {
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
      return this.props.children(this.state.value, this.setValue, this.props.injection)
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
