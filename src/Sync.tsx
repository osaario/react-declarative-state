import * as React from 'react'

export namespace Sync {
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
  export type GuardProps<T> = {
    initialGuard: T
    children: (
      tab: T,
      switchTab: (tab: T) => void,
      Tab: (props: { children: JSX.Element; name: T }) => JSX.Element | null
    ) => JSX.Element
  }
  export type GuardState<T> = {
    guard: T
  }

  export class Guard<T> extends React.Component<GuardProps<T>, GuardState<T>> {
    state: GuardState<T> = {
      guard: this.props.initialGuard
    }
    setGuard = (guard: T) => {
      this.setState({
        guard
      })
    }
    Guarded = (props: { children: JSX.Element; name: T }) => {
      if (props.name === this.state.guard) {
        return props.children
      }
      return null
    }
    render() {
      return this.props.children(this.state.guard, this.setGuard, this.Guarded)
    }
  }
}
