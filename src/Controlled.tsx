import { Async } from './Async'
import * as React from 'react'
import { Subscription, Subject, Observable } from 'rxjs'
import { createObservable, isAsync } from './utils'

export interface ControlledProps<T> {
  value: T | Observable<T>
  /** optional control key to drive new resolvation of value instead of prop value change */
  controlKey?: string
  /* Debounce subsequent controlKey or value changes. Does not debounce first resolve. */
  debounceTime?: number
  children: (data: T, progress: Async.Progress) => JSX.Element
  placeholder?: (progress: Async.Progress.Progressing | Async.Progress.Error) => JSX.Element
}

export interface ControlledState<T> {
  value: Async.Data<T | null>
}

export class Controlled<T> extends React.Component<ControlledProps<T>, ControlledState<T>> {
  subscriptions: Subscription[] = []
  reloadSubject = new Subject<T | Observable<T>>()
  state: ControlledState<T> = {
    value: Async.create(null, Async.Type.Load, Async.Progress.Progressing)
  }
  render() {
    if (this.state.value.data == null || this.state.value.state.progress === Async.Progress.Error) {
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
    if (this.props.debounceTime !== prevProps.debounceTime) {
      console.warn('Debounce time change has no effect after mount of component')
    }
    if (this.props.controlKey) {
      if (this.props.controlKey !== prevProps.controlKey) {
        this.reloadSubject.next(this.props.value)
      }
    } else {
      if (this.props.value !== prevProps.value) {
        this.reloadSubject.next(this.props.value)
      }
    }
  }
  componentDidMount() {
    const trigger = this.props.debounceTime
      ? this.reloadSubject.debounceTime(this.props.debounceTime)
      : this.reloadSubject
    this.subscriptions.push(
      trigger
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
          return createObservable(value!)
            .take(1)
            .catch(() => {
              this.setState({
                value: Async.setProgress(this.state.value, Async.Progress.Error)
              })
              return Observable.of(null)
            })
        })
        .filter(x => x != null)
        .subscribe(value => {
          this.setState({
            value: Async.set(this.state.value, value!, Async.Progress.Done)
          })
        })
    )
  }
}
