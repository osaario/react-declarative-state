import * as React from 'react'

export type VariableProps<T> = {
  initialValue: T
  children: (value: T, setVariable: (tab: T) => void) => JSX.Element
}
export type VariableState<T> = {
  value: T
}

export class Variable<T> extends React.Component<VariableProps<T>, VariableState<T>> {
  state: VariableState<T> = {
    value: this.props.initialValue
  }
  setVariable = (value: T) => {
    this.setState({
      value
    })
  }
  render() {
    return this.props.children(this.state.value, this.setVariable)
  }
}
