import { Async } from './Async'
import * as React from 'react'
import { Subscription, Subject, Observable } from 'rxjs'
import { createObservable, isAsync } from './utils'

// throw Error('TODOODO tee tästä searchable ja sortable yms mässyä !!!!')

export interface OperationProps<T> {
  onDone?: (value: T) => void
  children: (
    setValue: (value: Observable<T> | T) => void,
    progress: Async.Progress,
    asyncType: Async.Type
  ) => JSX.Element
}

export interface OperationState {
  progress: Async.Progress
  type: Async.Type
}

export class Operation<T> extends React.Component<OperationProps<T>, OperationState> {
  subscriptions: Subscription[] = []
  submitSubject = new Subject<Observable<T> | T>()
  loadSubject = new Subject()
  state: OperationState = {
    progress: Async.Progress.Normal,
    type: Async.Type.Load
  }
  setValue = (data: Observable<T> | T) => {
    this.submitSubject.next(data)
  }
  render() {
    return this.props.children(this.setValue, this.state.progress, this.state.type)
  }
  componentWillUnmount() {
    this.subscriptions.forEach(s => {
      s.unsubscribe()
    })
  }
  componentDidMount() {
    const submitObs = this.submitSubject
      .do(operation => {
        if (isAsync(operation)) {
          this.setState({
            progress: Async.Progress.Progressing,
            type: Async.Type.Update
          })
        }
      })
      .switchMap(value => {
        if (!isAsync) {
          return Observable.of(value as T)
        } else {
          return createObservable(value)
            .take(1)
            .catch(() => {
              this.setState({
                progress: Async.Progress.Error,
                type: Async.Type.Update
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
            progress: Async.Progress.Normal,
            type: Async.Type.Update
          },
          () => {
            if (this.props.onDone) this.props.onDone(value!)
          }
        )
      })
    )
  }
}
