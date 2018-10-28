/*
import * as React from 'react'
import * as _ from 'lodash'
import { Observable, Subscription, Subject } from 'rxjs'
import { Async } from './Async'
import { ProgressContainer } from './ProgressContainer'
import { ErrorAlert } from './ErrorAlert'
import { ProgressBar } from './ProgressBar'

interface LoaderSharedProps {
  approxMS?: number
  progressContainerStyle?: React.CSSProperties
  errorContainerStyle?: React.CSSProperties
  defaultPaddingOnProgressAndError?: boolean
  renderLoading?: () => JSX.Element | null
}

export interface LoaderProps<T> extends LoaderSharedProps {
  operation: Async.Operation<T, Async.Type.Load>
  children: (data: T, reloadTrigger: () => void) => JSX.Element
}

export interface LoaderState<T> {
  value: Async.Data<T | null>
}

function renderNoData(state: Async.State, props: LoaderSharedProps & { lang: string }) {
  if (state.progress === Async.Progress.Progressing) {
    if (props.renderLoading) {
      return props.renderLoading()
    }
    return (
      <div
        style={
          props.progressContainerStyle
            ? props.progressContainerStyle
            : props.defaultPaddingOnProgressAndError
              ? { padding: 15 }
              : {}
        }
      >
        <ProgressBar />
      </div>
    )
  } else {
    return (
      <div
        style={
          props.errorContainerStyle
            ? props.errorContainerStyle
            : props.defaultPaddingOnProgressAndError
              ? { padding: 15 }
              : {}
        }
      >
        <ErrorAlert asyncState={state} lang={props.lang} />
      </div>
    )
  }
}

export class Loader<T> extends React.Component<LoaderProps<T>, LoaderState<T>> {
  subscriptions: Subscription[] = []
  triggerSubject = new Subject()
  state: LoaderState<T> = {
    value: Async.create(null, Async.Type.Load, Async.Progress.Progressing)
  }
  render() {
    if (!this.state.value.data) {
      return renderNoData(this.state.value.state, { ...this.props, lang: this.context.lang } as any)
    }
    return (
      <ProgressContainer
        progressing={this.state.value.state.progress === Async.Progress.Progressing}
      >
        {this.props.children(this.state.value.data, this.reloadTrigger)}
      </ProgressContainer>
    )
  }
  reloadTrigger = () => {
    this.triggerSubject.next()
  }
  componentWillUnmount() {
    this.subscriptions.forEach(s => {
      s.unsubscribe()
    })
  }
  componentDidMount() {
    this.subscriptions.push(
      this.triggerSubject
        .do(() => {
          this.setState({
            value: Async.setProgress(this.state.value, Async.Progress.Progressing)
          })
        })
        .startWith(0)
        .switchMap(() => {
          return this.props.operation().catch(() => {
            this.setState({
              value: Async.setProgress(this.state.value, Async.Progress.Error)
            })
            return Observable.of(null)
          })
        })
        .filter(x => !!x)
        .subscribe(value => {
          this.setState({
            value: Async.set(this.state.value, value!, Async.Progress.Done)
          })
        })
    )
  }
}

export interface ObsLoaderProps<T> extends LoaderSharedProps {
  trigger: Observable<Observable<T>>
  children: (data: T) => JSX.Element
}

export interface ObsLoaderState<T> {
  value: Async.Data<T | null>
}

export class ObsLoader<T> extends React.Component<ObsLoaderProps<T>, ObsLoaderState<T>> {
  subscriptions: Subscription[] = []
  state: ObsLoaderState<T> = {
    value: Async.create(null, Async.Type.Load, Async.Progress.Progressing)
  }
  render() {
    if (!this.state.value.data) {
      return renderNoData(this.state.value.state, { ...this.props, lang: this.context.lang } as any)
    }
    return (
      <ProgressContainer
        progressing={this.state.value.state.progress === Async.Progress.Progressing}
      >
        {this.props.children(this.state.value.data)}
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
      this.props.trigger
        .do(() => {
          this.setState({
            value: Async.setProgress(this.state.value, Async.Progress.Progressing)
          })
        })
        .switchMap(operation => {
          return operation.catch(() => {
            this.setState({
              value: Async.setProgress(this.state.value, Async.Progress.Error)
            })
            return Observable.of(null)
          })
        })
        .filter(x => !!x)
        .subscribe(value => {
          this.setState({
            value: Async.set(this.state.value, value!, Async.Progress.Done)
          })
        })
    )
  }
}
*/
export default {}
