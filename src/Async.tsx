import * as React from 'react'
import * as _ from 'lodash'
import { Observable, Subscription, Subject } from 'rxjs'

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

  export function DELETE(url: string): Observable<null> {
    return Observable.fromPromise(
      fetch(url, {
        method: 'DELETE',
        headers: { ...headers }
      }).then(response => {
        if (response.ok) {
          return null
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
    value: Observable<T>
    children: (data: T, progress: Async.Progress) => JSX.Element
    placeholder?: (progress: Async.Progress.Progressing | Async.Progress.Error) => JSX.Element
  }

  export interface ConstState<T> {
    value: Async.Data<T | null>
  }

  export class Const<T> extends React.Component<ConstProps<T>, ConstState<T>> {
    subscriptions: Subscription[] = []
    state: ConstState<T> = {
      value: Async.create(null, Async.Type.Load, Async.Progress.Progressing)
    }
    render() {
      if (!this.state.value.data) {
        return this.props.placeholder && this.props.placeholder(this.state.value.state.progress as any)
      }
      return this.props.children(this.state.value.data, this.state.value.state.progress)
    }
    componentWillUnmount() {
      this.subscriptions.forEach(s => {
        s.unsubscribe()
      })
    }
    componentDidMount() {
      this.subscriptions.push(
        Observable.of(0)
          .do(() => {
            this.setState({
              value: Async.setProgress(this.state.value, Async.Progress.Progressing)
            })
          })
          .startWith(0)
          .switchMap(() => {
            return this.props.value.catch(() => {
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
  export interface VarProps<T> {
    setter: (value: T | null) => { operation: Observable<T | null>; type: Async.Type }
    initialValue: Observable<T>
    onChange?: (value: T | null) => void
    placeholder?: (progress: Async.Progress.Progressing | Async.Progress.Error) => JSX.Element
    children: (data: T, asyncState: Async.State, setValue: (value: T | null) => void) => JSX.Element
  }

  export interface VarState<T> {
    value: T | null
    asyncState: Async.State
  }

  export class Var<T> extends React.Component<VarProps<T>, VarState<T>> {
    subscriptions: Subscription[] = []
    submitSubject = new Subject<T | null>()
    state: VarState<T> = {
      asyncState: {
        progress: Async.Progress.Normal,
        type: Async.Type.Load
      },
      value: null
    }
    setValue = (data: T | null) => {
      this.submitSubject.next(data)
    }
    render() {
      if (this.state.value) {
        return this.props.children(this.state.value, this.state.asyncState, this.setValue)
      } else {
        return this.props.placeholder && this.props.placeholder(this.state.asyncState as any)
      }
    }
    componentWillUnmount() {
      this.subscriptions.forEach(s => {
        s.unsubscribe()
      })
    }
    componentDidMount() {
      this.subscriptions.push(
        Observable.of(0)
          .do(() => {
            this.setState({
              asyncState: {
                progress: Async.Progress.Progressing,
                type: Async.Type.Load
              }
            })
          })
          .startWith(0)
          .switchMap(() => {
            return this.props.initialValue.catch(() => {
              this.setState({
                asyncState: {
                  progress: Async.Progress.Error,
                  type: Async.Type.Load
                }
              })
              return Observable.of(null)
            })
          })
          .filter(x => !!x)
          .subscribe(value => {
            this.setState({
              asyncState: {
                progress: Async.Progress.Error,
                type: Async.Type.Load
              },
              value
            })
          })
      )
      const submitObs = this.submitSubject
        .map(value => this.props.setter(value))
        .do(operation => {
          this.setState({
            asyncState: {
              progress: Async.Progress.Progressing,
              type: operation.type
            }
          })
        })
        .switchMap(operation => {
          return operation.operation.catch(() => {
            this.setState({
              asyncState: {
                progress: Async.Progress.Error,
                type: operation.type
              }
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
              asyncState: {
                progress: Async.Progress.Normal,
                type: Async.Type.Load
              }
            },
            () => {
              if (this.props.onChange) this.props.onChange(value)
            }
          )
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
