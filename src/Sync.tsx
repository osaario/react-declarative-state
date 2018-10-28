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
    value: T
    children: (
      Guarded: (props: { children: JSX.Element; name: T }) => JSX.Element | null,
      setValue: (guard: T) => void
    ) => JSX.Element
  }
  export type GuardState<T> = {
    value: T
  }

  export class Guard<T> extends React.Component<GuardProps<T>, GuardState<T>> {
    state: GuardState<T> = {
      value: this.props.value
    }
    setValue = (value: T) => {
      this.setState({
        value
      })
    }
    Guarded = (props: { children: JSX.Element; name: T }) => {
      if (props.name === this.state.value) {
        return props.children
      }
      return null
    }
    componentDidUpdate(prevProps: GuardProps<T>) {
      if (prevProps.value !== this.props.value) {
        console.log('Guard updated')
        this.setState({
          value: this.props.value
        })
      }
    }
    render() {
      return this.props.children(this.Guarded, this.setValue)
    }
  }
}
