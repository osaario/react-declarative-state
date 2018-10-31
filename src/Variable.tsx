import { Async } from './Async'
import * as React from 'react'
import { Subscription, Subject, Observable } from 'rxjs'

export interface VariableProps<T> {
  setter: (value: T) => Promise<T>
  getter: () => Promise<T>
  onValueSet?: (value: T) => void
  placeholder?: (progress: Async.Progress, asyncType: Async.Type) => JSX.Element
  children: (data: T, progress: Async.Progress, setValue: (value: T) => void, asyncType: Async.Type) => JSX.Element
}

export interface VariableState<T> {
  value: T | null
  progress: Async.Progress
  type: Async.Type
}

export class Variable<T> extends React.Component<VariableProps<T>, VariableState<T>> {
  subscriptions: Subscription[] = []
  submitSubject = new Subject<T>()
  loadSubject = new Subject()
  state: VariableState<T> = {
    progress: Async.Progress.Normal,
    type: Async.Type.Load,
    value: null
  }
  setValue = (data: T) => {
    this.submitSubject.next(data)
  }
  render() {
    if (this.state.value) {
      return this.props.children(this.state.value, this.state.progress, this.setValue, this.state.type)
    } else {
      return this.props.placeholder ? this.props.placeholder(this.state.progress, this.state.type) : null
    }
  }
  componentWillUnmount() {
    this.subscriptions.forEach(s => {
      s.unsubscribe()
    })
  }
  componentDidUpdate(prevProps: VariableProps<T>) {
    if (this.props.getter !== prevProps.getter) {
      this.loadSubject.next()
    }
  }
  componentDidMount() {
    this.subscriptions.push(
      this.loadSubject
        .startWith(0)
        .do(() => {
          this.setState({
            progress: Async.Progress.Progressing,
            type: Async.Type.Load
          })
        })
        .startWith(0)
        .switchMap(() => {
          return Observable.fromPromise(this.props.getter()).catch(() => {
            this.setState({
              progress: Async.Progress.Error,
              type: Async.Type.Load
            })
            return Observable.of(null)
          })
        })
        .filter(x => !!x)
        .subscribe(value => {
          this.setState({
            progress: Async.Progress.Normal,
            type: Async.Type.Load,
            value
          })
        })
    )
    const submitObs = this.submitSubject
      .do(() => {
        this.setState({
          progress: Async.Progress.Progressing,
          type: Async.Type.Update
        })
      })
      .switchMap(value => {
        return Observable.fromPromise(this.props.setter(value)).catch(() => {
          this.setState({
            progress: Async.Progress.Error,
            type: Async.Type.Update
          })
          return Observable.of(null)
        })
      })
      .filter(x => !!x)
    this.subscriptions.push(
      submitObs.subscribe(value => {
        this.setState(
          {
            value,
            progress: Async.Progress.Normal,
            type: Async.Type.Update
          },
          () => {
            if (this.props.onValueSet) this.props.onValueSet(value!)
          }
        )
      })
    )
  }
}
