import * as React from 'react'
import { Subscription, Subject, Observable } from 'rxjs'

export interface PersistedProps<T> {
  /** initial value if value not found in storage */
  initialValue: T
  /** whether to user local or session storage */
  storage?: 'localStorage' | 'sessionStorage'
  /** key to store to storage */
  storeKey: string
  /** children to be rendered */
  children: (value: T, setValue: (value: T) => void) => JSX.Element
}

export interface PersistedState<T> {
  value: T
}

export class Persisted<T> extends React.Component<PersistedProps<T>, PersistedState<T>> {
  subscriptions: Subscription[] = []
  submitSubject = new Subject<T | Observable<T>>()
  loadSubject = new Subject()
  getDataFromStorage = () => {
    let unparsed = null
    if (this.props.storage === 'sessionStorage') {
      unparsed = sessionStorage.getItem(this.props.storeKey)
    } else {
      unparsed = localStorage.getItem(this.props.storeKey)
    }
    return unparsed && JSON.parse(unparsed)
  }
  persistData = (value: T) => {
    if (this.props.storage === 'sessionStorage') {
      sessionStorage.setItem(this.props.storeKey, JSON.stringify(value))
    } else {
      localStorage.setItem(this.props.storeKey, JSON.stringify(value))
    }
  }

  state: PersistedState<T> = {
    value: this.getDataFromStorage() || this.props.initialValue
  }
  setValue = (data: T) => {
    this.setState({ value: data })
  }
  componentWillUnmount() {
    this.persistData(this.state.value)
  }
  render() {
    return this.props.children(this.state.value, this.setValue)
  }
}
