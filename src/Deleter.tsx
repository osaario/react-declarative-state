import React from 'react'
import _ from 'lodash'
import { Observable, Subscription, Subject } from 'rxjs'
import { Async } from './Async'
import ProgressContainer from './ProgressContainer'

export interface DeleterProps<T> {
  onDone: (id: string) => void
  operation: Async.Operation<T, Async.Type.Delete>
  transparentOnProgress?: boolean
  children: (progress: Async.Progress, trigger: (id: string) => void) => JSX.Element
}

export interface DeleterState {
  progress: Async.Progress
}

export class Deleter<T> extends React.Component<DeleterProps<T>, DeleterState> {
  subscriptions: Subscription[] = []
  deleteSubject = new Subject<string>()
  state: DeleterState = {
    progress: Async.Progress.Normal
  }
  trigger = (id: string) => {
    this.deleteSubject.next(id)
  }
  render() {
    return (
      <ProgressContainer
        opaque={!this.props.transparentOnProgress}
        progressing={this.state.progress === Async.Progress.Progressing}
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
    this.subscriptions.push(
      this.deleteSubject
        .do(() => {
          this.setState({
            progress: Async.Progress.Progressing
          })
        })
        .switchMap(value => {
          return this.props
            .operation(value)
            .catch(() => {
              this.setState({
                progress: Async.Progress.Error
              })
              return Observable.of(null)
            })
            .map(_ => value)
        })
        .filter(x => !!x)
        .subscribe(id => {
          this.setState(
            {
              progress: Async.Progress.Done
            },
            () => {
              this.props.onDone(id)
            }
          )
        })
    )
  }
}
