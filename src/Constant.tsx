import { Async } from './Async'
import * as React from 'react'
import { Subscription, Subject, Observable } from 'rxjs'
import { createObservable, isAsync } from './utils'

export interface ConstantProps<T> {
  /** Value, if an Observable the value will be resolved and placeholder will be shown before a concreate value is obtained.  */
  value: T | Observable<T>
  children: (data: T, progress: Async.Progress) => JSX.Element
  placeholder?: (progress: Async.Progress.Progressing | Async.Progress.Error) => JSX.Element
}

export interface ConstantState<T> {
  value: Async.Data<T | null>
}

/** Resolve a one-off value and render a placeholdern on error or before the value is obtained. */
export class Constant<T> extends React.Component<ConstantProps<T>, ConstantState<T>> {
  subscriptions: Subscription[] = []
  reloadSubject = new Subject()
  state: ConstantState<T> = {
    value: Async.create(null, Async.Type.Load, Async.Progress.Progressing)
  }
  render() {
    if (this.state.value.data == null) {
      return this.props.placeholder ? this.props.placeholder(this.state.value.state.progress as any) : null
    }
    return this.props.children(this.state.value.data, this.state.value.state.progress)
  }
  componentWillUnmount() {
    this.subscriptions.forEach(s => {
      s.unsubscribe()
    })
  }
  componentDidMount() {
    if (isAsync(this.props.value)) {
      this.subscriptions.push(
        createObservable(this.props.value)
          .catch(() => {
            this.setState({
              value: Async.setProgress(this.state.value, Async.Progress.Error)
            })
            return Observable.of(null)
          })
          .filter(x => x != null)
          .subscribe(value => {
            this.setState({
              value: Async.set(this.state.value, value!, Async.Progress.Done)
            })
          })
      )
    } else {
      this.setState({
        value: Async.set(this.state.value, this.props.value as T, Async.Progress.Done)
      })
    }
  }
}
