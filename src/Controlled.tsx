import { Async } from './Async'
import * as React from 'react'
import { Subscription, Subject, Observable } from 'rxjs'
import { createObservable, isAsync, DCValueType } from './utils'

export interface ControlledProps<T> {
  value: DCValueType<T>
  children: (data: T, progress: Async.Progress) => JSX.Element
  placeholder?: (progress: Async.Progress.Progressing | Async.Progress.Error) => JSX.Element
}

export interface ControlledState<T> {
  value: Async.Data<T | null>
}

export class Controlled<T> extends React.Component<ControlledProps<T>, ControlledState<T>> {
  subscriptions: Subscription[] = []
  reloadSubject = new Subject<DCValueType<T>>()
  state: ControlledState<T> = {
    value: Async.create(null, Async.Type.Load, Async.Progress.Progressing)
  }
  render() {
    if (!this.state.value.data || this.state.value.state.progress === Async.Progress.Error) {
      return this.props.placeholder ? this.props.placeholder(this.state.value.state.progress as any) : null
    }
    return this.props.children(this.state.value.data, this.state.value.state.progress)
  }
  componentWillUnmount() {
    this.subscriptions.forEach(s => {
      s.unsubscribe()
    })
  }
  componentDidUpdate(prevProps: ControlledProps<T>) {
    if (this.props.value !== prevProps.value) {
      this.reloadSubject.next(this.props.value)
    }
  }
  componentDidMount() {
    this.subscriptions.push(
      this.reloadSubject
        .do(operation => {
          if (isAsync(operation)) {
            this.setState({
              value: Async.setProgress(this.state.value, Async.Progress.Progressing)
            })
          }
        })
        .startWith(this.props.value)
        .switchMap(value => {
          if (!isAsync(value!)) {
            return Observable.of(value as T)
          }
          return createObservable(value!).catch(() => {
            this.setState({
              value: Async.setProgress(this.state.value, Async.Progress.Error)
            })
            return Observable.of(null)
          })
        })
        .filter(x => !!x)
        .subscribe(value => {
          this.setState({
            value: Async.set(this.state.value, value!, Async.Progress.Done)
          })
        })
    )
  }
}
