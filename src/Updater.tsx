import React from 'react'
import _ from 'lodash'
import { Observable, Subscription, Subject } from 'rxjs'
import { Async } from './Async'
import { ProgressContainer } from './ProgressContainer'

export const enum DefaultUpdateDelay {
  Modal = 1000,
  Page = 3000,
  None = 0
}

export interface UpdaterProps<T> {
  onDone?: (data: T) => void
  operation: Async.Operation<T, Async.Type.Update>
  resetDelay?: DefaultUpdateDelay | number
  transparentOnProgress?: boolean
  children: (
    progress: Async.Progress,
    trigger: (data: T) => void,
    lastData: T | null
  ) => JSX.Element
}

export interface UpdaterState<T> {
  progress: Async.Progress
  lastData: T | null
}

export class Updater<T> extends React.Component<UpdaterProps<T>, UpdaterState<T>> {
  subscriptions: Subscription[] = []
  submitSubject = new Subject<T>()
  state: UpdaterState<T> = {
    progress: Async.Progress.Normal,
    lastData: null
  }
  trigger = (data: T) => {
    this.submitSubject.next(data)
  }
  render() {
    return (
      <ProgressContainer
        opaque={!this.props.transparentOnProgress}
        progressing={this.state.progress === Async.Progress.Progressing}
      >
        {this.props.children(this.state.progress, this.trigger, this.state.lastData)}
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
          .delay(this.props.resetDelay)
          .subscribe(data => {
            this.setState(
              {
                lastData: data,
                progress: Async.Progress.Normal
              },
              () => {
                if (this.props.onDone) this.props.onDone(data!)
              }
            )
          })
      )
    } else {
      this.subscriptions.push(
        submitObs.subscribe(data => {
          this.setState(
            {
              lastData: data,
              progress: Async.Progress.Normal
            },
            () => {
              if (this.props.onDone) this.props.onDone(data!)
            }
          )
        })
      )
    }
  }
}
