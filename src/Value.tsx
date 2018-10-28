import * as React from 'react'

export type ValueProps<T> = {
  initialValue: T
  children: (value: T, setValue: (tab: T) => void) => JSX.Element
}
export type ValueState<T> = {
  value: T
}

export class Value<T> extends React.Component<ValueProps<T>, ValueState<T>> {
  state: ValueState<T> = {
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
