import { Async } from './Async'
import * as React from 'react'
import { Subscription, Subject, Observable } from 'rxjs'
import { createObservable, isAsync } from './utils'

export interface StreamProps<T> {
  // Stream of sync or async values
  value: Observable<T | Observable<T>>
  // Children to be rendered when value
  children: (data: T, progress: Async.Progress) => JSX.Element
  // Placeholder to be rendered when there is no concrete value yet
  placeholder?: (progress: Async.Progress.Progressing | Async.Progress.Error) => JSX.Element
}

export interface StreamState<T> {
  value: Async.Data<T | null>
}

/* Pass a stream of sync or async values as a prop to the Stream component. Stream will resolve these and inject progress in case of async values */
export class Stream<T> extends React.Component<StreamProps<T>, StreamState<T>> {
  subscriptions: Subscription[] = []
  reloadSubject = new Subject<T | Observable<T>>()
  state: StreamState<T> = {
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
    this.subscriptions.push(
      this.props
        .value!.do(operation => {
          if (isAsync(operation)) {
            this.setState({
              value: Async.setProgress(this.state.value, Async.Progress.Progressing)
            })
          }
        })
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
        .filter(x => x != null)
        .subscribe(value => {
          this.setState({
            value: Async.set(this.state.value, value!, Async.Progress.Done)
          })
        })
    )
  }
}
