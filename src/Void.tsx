import { Async } from './Async'
import * as React from 'react'
import { Subscription, Subject, Observable } from 'rxjs'

// throw Error('TODOODO tee tästä searchable ja sortable yms mässyä !!!!')

export interface VoidProps<T> {
  onValueSet?: (value: T) => void
  placeholder?: (progress: Async.Progress, asyncType: Async.Type) => JSX.Element
  children: (setValue: (value: Promise<T>) => void, progress: Async.Progress, asyncType: Async.Type) => JSX.Element
}

export interface VoidState<T> {
  value: T | null
  progress: Async.Progress
  type: Async.Type
}

export class Void<T> extends React.Component<VoidProps<T>, VoidState<T>> {
  subscriptions: Subscription[] = []
  submitSubject = new Subject<Promise<T>>()
  loadSubject = new Subject()
  state: VoidState<T> = {
    progress: Async.Progress.Normal,
    type: Async.Type.Load,
    value: null
  }
  setValue = (data: Promise<T>) => {
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
      .do(() => {
        this.setState({
          progress: Async.Progress.Progressing,
          type: Async.Type.Update
        })
      })
      .switchMap(value => {
        return Observable.fromPromise(value).catch(() => {
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
