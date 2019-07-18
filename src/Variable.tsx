import { Async } from './Async'
import * as React from 'react'
import { Subscription, Subject, Observable } from 'rxjs'
import { createObservable, isAsync } from './utils'

// throw Error('TODOODO tee tästä searchable ja sortable yms mässyä !!!!')

export interface VariableProps<T> {
  initialValue: T | Observable<T>
  onChanged?: (value: T) => void
  placeholder?: (progress: Async.Progress, error?: any) => JSX.Element
  children: (
    value: T,
    setValue: (value: T | Observable<T>) => void,
    progress: Async.Progress,
    error?: any
  ) => JSX.Element
}

export interface VariableState<T> {
  value: T | null
  progress: Async.Progress
  error?: any
}

export class Variable<T> extends React.Component<VariableProps<T>, VariableState<T>> {
  subscriptions: Subscription[] = []
  submitSubject = new Subject<T | Observable<T>>()
  loadSubject = new Subject()
  state: VariableState<T> = {
    progress: isAsync(this.props.initialValue) ? Async.Progress.Progressing : Async.Progress.Normal,
    value: null
  }
  setValue = (data: T | Observable<T>) => {
    this.submitSubject.next(data)
  }
  render() {
    if (this.state.value != null && this.state.progress !== Async.Progress.Error) {
      return this.props.children(this.state.value, this.setValue, this.state.progress, this.state.error)
    } else {
      return this.props.placeholder ? this.props.placeholder(this.state.progress, this.state.error) : null
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
        createObservable(this.props.initialValue)
          .take(1)
          .catch(err => {
            this.setState({
              progress: Async.Progress.Error,
              error: err
            })
            return Observable.of(null)
          })
          .filter(x => x != null)
          .subscribe(value => {
            this.setState({
              progress: Async.Progress.Normal,
              error: undefined,
              value
            })
          })
      )
    } else {
      this.setState({
        progress: Async.Progress.Normal,
        error: undefined,
        value: this.props.initialValue as T
      })
    }
    const submitObs = this.submitSubject
      .do(operation => {
        // skip unneccessary loading indicators on sync operations
        if (isAsync(operation)) {
          this.setState({
            progress: Async.Progress.Progressing,
            error: undefined
          })
        }
      })
      .switchMap(value => {
        if (!isAsync(value)) return Observable.of(value as T)
        else {
          return createObservable(value)
            .take(1)
            .catch(err => {
              this.setState({
                progress: Async.Progress.Error,
                error: err
              })
              return Observable.of(null)
            })
        }
      })
      .filter(x => x != null)
    this.subscriptions.push(
      submitObs.subscribe(value => {
        this.setState(
          {
            value,
            progress: Async.Progress.Normal,
            error: undefined
          },
          () => {
            if (this.props.onChanged) this.props.onChanged(value!)
          }
        )
      })
    )
  }
}
