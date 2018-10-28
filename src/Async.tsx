import * as React from 'react'
import * as _ from 'lodash'
import { Observable, Subscription, Subject } from 'rxjs'
import { ProgressContainer } from './ProgressContainer'
import { ErrorAlert } from './ErrorAlert'
import { ProgressBar } from './ProgressBar'

export namespace Async {
  export const enum Type {
    Load = 1,
    Create,
    Update,
    Delete
  }

  export const enum Progress {
    Normal = 1,
    Progressing,
    Done,
    Error
  }

  export namespace Model {
    export type Full<P extends object, G extends object> = { [K in keyof (P & G)]: (P & G)[K] }

    export type Incomplete<T> = T extends Full<infer P, infer __> ? P : never
  }

  export interface State {
    progress: Progress
    type: Type
  }

  export type Data<T> = { data: T; state: State }

  export type Operation<E, T extends Type> = T extends Type.Load
    ? () => Observable<E>
    : T extends Type.Delete
      ? (id: string) => Observable<number>
      : (data: T extends Type.Create ? Model.Incomplete<E> : E) => Observable<E>

  export type ObservableOperation<E> = Observable<E>

  export function create<T>(data: T, type: Type, initialProgress = Progress.Normal): Data<T> {
    return {
      data,
      state: {
        type,
        progress: initialProgress
      }
    }
  }

  export function set<T>(value: Data<T>, data: T, progress?: Progress, type?: Type): Data<T> {
    return {
      data: data,
      state: {
        type: type || value.state.type,
        progress: progress || value.state.progress
      }
    }
  }

  export function setProgress<T>(value: Data<T>, progress: Progress): Data<T> {
    return {
      data: value.data,
      state: {
        ...value.state,
        progress: progress
      }
    }
  }
  const headers = {
    'Content-Type': 'application/json'
  }

  export function GET<T>(url: string) {
    return Observable.fromPromise(
      fetch(url, {
        method: 'GET',
        headers: { ...headers }
      }).then(response => {
        if (response.ok) {
          return response.json()
        }
        throw Error(response.status.toString())
      })
    ) as Observable<T>
  }

  export function DELETE(url: string): Observable<number> {
    return Observable.fromPromise(
      fetch(url, {
        method: 'DELETE',
        headers: { ...headers }
      }).then(response => {
        if (response.ok) {
          return response.status
        }
        throw Error(response.status.toString())
      })
    )
  }

  export function POST<T>(url: string, data: T) {
    return Observable.fromPromise(
      fetch(url, {
        method: 'POST',
        headers: { ...headers },
        body: JSON.stringify(data)
      }).then(response => {
        if (response.ok) {
          if (response.status === 204) return response.status
          return response.json()
        }
        throw Error(response.status.toString())
      })
    )
  }

  export function PUT<T>(url: string, data: T) {
    return Observable.fromPromise(
      fetch(url, {
        method: 'PUT',
        headers: { ...headers },
        body: JSON.stringify(data)
      }).then(response => {
        if (response.ok) {
          if (response.status === 204) return response.status
          return response.json()
        }
        throw Error(response.status.toString())
      })
    )
  }
  export interface ConstSharedProps {
    approxMS?: number
    progressContainerStyle?: React.CSSProperties
    errorContainerStyle?: React.CSSProperties
    defaultPaddingOnProgressAndError?: boolean
    renderLoading?: () => JSX.Element | null
  }

  export interface ConstProps<T> extends ConstSharedProps {
    getInitialValue: Async.Operation<T, Async.Type.Load>
    children: (data: T, reloadTrigger: () => void) => JSX.Element
  }

  export interface ConstState<T> {
    value: Async.Data<T | null>
  }

  function renderNoData(state: Async.State, props: ConstSharedProps & { lang: string }) {
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

  export class Const<T> extends React.Component<ConstProps<T>, ConstState<T>> {
    subscriptions: Subscription[] = []
    triggerSubject = new Subject()
    state: ConstState<T> = {
      value: Async.create(null, Async.Type.Load, Async.Progress.Progressing)
    }
    render() {
      if (!this.state.value.data) {
        return renderNoData(this.state.value.state, {
          ...this.props,
          lang: this.context.lang
        } as any)
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
            return this.props.getInitialValue().catch(() => {
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

  /*
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
        return renderNoData(this.state.value.state, {
          ...this.props,
          lang: this.context.lang
        } as any)
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
  }*/
}
