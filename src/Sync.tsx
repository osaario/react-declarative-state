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
  export type TabbedProps<T> = {
    options: T[]
    children: (
      tab: T,
      switchTab: (tab: T) => void,
      Tab: (props: { children: JSX.Element; name: T }) => JSX.Element | null
    ) => JSX.Element
  }
  export type TabbedState<T> = {
    tab: T
  }

  export class Tabbed<T> extends React.Component<TabbedProps<T>, TabbedState<T>> {
    state: TabbedState<T> = {
      tab: this.props.options[0]
    }
    switchTab = (tab: T) => {
      this.setState({
        tab
      })
    }
    Tab = (props: { children: JSX.Element; name: T }) => {
      if (props.name === this.state.tab) {
        return props.children
      }
      return null
    }
    render() {
      return this.props.children(this.state.tab, this.switchTab, this.Tab)
    }
  }

  export class ModalSwitch<T> extends Tabbed<T | null> {}
  export class Selecter<T> extends Tabbed<T> {}
}
