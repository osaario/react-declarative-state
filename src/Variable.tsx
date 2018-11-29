import { Async } from './Async'
import * as React from 'react'
import { Subscription, Subject, Observable } from 'rxjs'
import { createObservable, isAsync } from './utils'

// throw Error('TODOODO tee tästä searchable ja sortable yms mässyä !!!!')

export interface VariableProps<T> {
  initialValue: T | Observable<T>
  onChanged?: (value: T) => void
  placeholder?: (progress: Async.Progress, asyncType: Async.Type) => JSX.Element
  children: (
    value: T,
    setValue: (value: T | Observable<T>) => void,
    progress: Async.Progress,
    asyncType: Async.Type
  ) => JSX.Element
}

export interface VariableState<T> {
  value: T | null
  progress: Async.Progress
  type: Async.Type
}

export class Variable<T> extends React.Component<VariableProps<T>, VariableState<T>> {
  subscriptions: Subscription[] = []
  submitSubject = new Subject<T | Observable<T>>()
  loadSubject = new Subject()
  state: VariableState<T> = {
    progress: Async.Progress.Normal,
    type: Async.Type.Load,
    value: null
  }
  setValue = (data: T | Observable<T>) => {
    this.submitSubject.next(data)
  }
  render() {
    if (this.state.value && this.state.progress !== Async.Progress.Error) {
      return this.props.children(this.state.value, this.setValue, this.state.progress, this.state.type)
    } else {
      return this.props.placeholder ? this.props.placeholder(this.state.progress, this.state.type) : null
    }
  }
  componentWillUnmount() {
    this.subscriptions.forEach(s => {
      s.unsubscribe()
    })
  }
  componentDidMount() {
    if (isAsync(this.props.initialValue)) {
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
            return createObservable(this.props.initialValue).catch(() => {
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
    } else {
      this.setState({
        progress: Async.Progress.Normal,
        type: Async.Type.Load,
        value: this.props.initialValue as T
      })
    }
    const submitObs = this.submitSubject
      .do(operation => {
        // skip unneccessary loading indicators on sync operations
        if (isAsync(operation)) {
          this.setState({
            progress: Async.Progress.Progressing,
            type: Async.Type.Update
          })
        }
      })
      .switchMap(value => {
        if (!isAsync(value)) return Observable.of(value as T)
        else {
          return createObservable(value).catch(() => {
            this.setState({
              progress: Async.Progress.Error,
              type: Async.Type.Update
            })
            return Observable.of(null)
          })
        }
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
            if (this.props.onChanged) this.props.onChanged(value!)
          }
        )
      })
    )
  }
}
