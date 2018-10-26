import React from 'react'
import _ from 'lodash'
import { Observable, Subscription, Subject } from 'rxjs'
import { Async } from './Async'
import ProgressContainer from './ProgressContainer'

export const enum DefaultCreateDelay {
  Modal = 1000,
  Page = 3000,
  None = 0
}

export interface CreaterProps<T> {
  onDone: (data: T) => void
  operation: Async.Operation<T, Async.Type.Create>
  resetDelay?: DefaultCreateDelay | number
  transparentOnProgress?: boolean
  children: (
    progress: Async.Progress,
    trigger: (data: Async.Model.Incomplete<T>) => void
  ) => JSX.Element
}

export interface CreaterState {
  progress: Async.Progress
}

export class Creater<T> extends React.Component<CreaterProps<T>, CreaterState> {
  subscriptions: Subscription[] = []
  submitSubject = new Subject<Async.Model.Incomplete<T>>()
  state: CreaterState = {
    progress: Async.Progress.Normal
  }
  trigger = (data: Async.Model.Incomplete<T>) => {
    this.submitSubject.next(data)
  }
  render() {
    return (
      <ProgressContainer
        progressing={this.state.progress === Async.Progress.Progressing}
        opaque={!this.props.transparentOnProgress}
      >
        {this.props.children(this.state.progress, this.trigger)}
      </ProgressContainer>
    )
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
          progress: Async.Progress.Progressing
        })
      })
      .switchMap(value => {
        return this.props.operation(value).catch(() => {
          this.setState({
            progress: Async.Progress.Error
          })
          return Observable.of(null)
        })
      })
      .filter(x => !!x)
    if (this.props.resetDelay) {
      this.subscriptions.push(
        submitObs
          .do(() => {
            this.setState({
              progress: Async.Progress.Done
            })
          })
          .delay(1000)
          .subscribe(data => {
            this.setState(
              {
                progress: Async.Progress.Normal
              },
              () => {
                this.props.onDone(data!)
              }
            )
          })
      )
    } else {
      this.subscriptions.push(
        submitObs.subscribe(data => {
          this.setState(
            {
              progress: Async.Progress.Normal
            },
            () => {
              this.props.onDone(data!)
            }
          )
        })
      )
    }
  }
}
