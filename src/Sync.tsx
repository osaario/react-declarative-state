import * as React from 'react'

export namespace Sync {
  export type PureVarProps<T, E extends object> = {
    initialValue: T
    injections: E
    children: (value: T, setValue: (tab: T) => void, injections: E) => JSX.Element
  }
  export type PureVarState<T> = {
    value: T
  }

  function shallowCompare(newObj: object, prevObj: object) {
    for (const key in newObj) {
      if (newObj[key] !== prevObj[key]) return true
    }
    return false
  }

  export class PureVar<T, E extends object> extends React.Component<PureVarProps<T, E>, VarState<T>> {
    shouldComponentUpdate(nextProps: PureVarProps<T, E>, nextState: VarState<T>) {
      if (this.state.value === nextState.value && !shallowCompare(nextProps.injections, this.props.injections)) {
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
