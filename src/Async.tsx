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

  export function isLoading(progress: Progress, type: Type) {
    return progress === Progress.Progressing && type === Async.Type.Load
  }

  const headers = {
    'Content-Type': 'application/json'
  }

  export function GET<T>(url: string): Promise<T> {
    return fetch(url, {
      method: 'GET',
      headers: { ...headers }
    }).then(response => {
      if (response.ok) {
        return response.json()
      }
      throw Error(response.status.toString())
    })
  }

  export function DELETE(url: string): Promise<null> {
    return fetch(url, {
      method: 'DELETE',
      headers: { ...headers }
    }).then(response => {
      if (response.ok) {
        return null
      }
      throw Error(response.status.toString())
    })
  }

  export function POST<T>(url: string, data: T): Promise<T> {
    return fetch(url, {
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
  }

  export function PUT<T>(url: string, data: T): Promise<T> {
    return fetch(url, {
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
  }
  export interface ConstSharedProps {
    approxMS?: number
    progressContainerStyle?: React.CSSProperties
    errorContainerStyle?: React.CSSProperties
    defaultPaddingOnProgressAndError?: boolean
    renderLoading?: () => JSX.Element | null
  }

  export interface ConstProps<T> extends ConstSharedProps {
    getter: () => Promise<T>
    children: (data: T, progress: Progress) => JSX.Element
    placeholder?: (progress: Progress.Progressing | Progress.Error) => JSX.Element
  }

  export interface ConstState<T> {
    value: Data<T | null>
  }

  export class Const<T> extends React.Component<ConstProps<T>, ConstState<T>> {
    subscriptions: Subscription[] = []
    reloadSubject = new Subject()
    state: ConstState<T> = {
      value: create(null, Type.Load, Progress.Progressing)
    }
    render() {
      if (!this.state.value.data) {
        return this.props.placeholder ? this.props.placeholder(this.state.value.state.progress as any) : null
      }
      return this.props.children(this.state.value.data, this.state.value.state.progress)
    }
    componentWillUnmount() {
      this.subscriptions.forEach(s => {
        s.unsubscribe()
      })
    }
    componentDidUpdate(prevProps: ConstProps<T>) {
      if (this.props.getter !== prevProps.getter) {
        this.reloadSubject.next()
      }
    }
    componentDidMount() {
      this.subscriptions.push(
        this.reloadSubject
          .startWith(0)
          .do(() => {
            this.setState({
              value: setProgress(this.state.value, Progress.Progressing)
            })
          })
          .startWith(0)
          .switchMap(() => {
            return Observable.fromPromise(this.props.getter()).catch(() => {
              this.setState({
                value: setProgress(this.state.value, Progress.Error)
              })
              return Observable.of(null)
            })
          })
          .filter(x => !!x)
          .subscribe(value => {
            this.setState({
              value: set(this.state.value, value!, Progress.Done)
            })
          })
      )
    }
  }
  export interface VarProps<T> {
    setter: (value: T) => Promise<T>
    getter: () => Promise<T>
    onValueSet?: (value: T) => void
    placeholder?: (progress: Progress, asyncType: Type) => JSX.Element
    children: (data: T, progress: Progress, setValue: (value: T) => void, asyncType: Type) => JSX.Element
  }

  export interface VarState<T> {
    value: T | null
    progress: Progress
    type: Type
  }

  export class Var<T> extends React.Component<VarProps<T>, VarState<T>> {
    subscriptions: Subscription[] = []
    submitSubject = new Subject<T>()
    loadSubject = new Subject()
    state: VarState<T> = {
      progress: Progress.Normal,
      type: Type.Load,
      value: null
    }
    setValue = (data: T) => {
      this.submitSubject.next(data)
    }
    render() {
      if (this.state.value) {
        return this.props.children(this.state.value, this.state.progress, this.setValue, this.state.type)
      } else {
        return this.props.placeholder ? this.props.placeholder(this.state.progress, this.state.type) : null
      }
    }
    componentWillUnmount() {
      this.subscriptions.forEach(s => {
        s.unsubscribe()
      })
    }
    componentDidUpdate(prevProps: VarProps<T>) {
      if (this.props.getter !== prevProps.getter) {
        this.loadSubject.next()
      }
    }
    componentDidMount() {
      this.subscriptions.push(
        this.loadSubject
          .startWith(0)
          .do(() => {
            this.setState({
              progress: Progress.Progressing,
              type: Type.Load
            })
          })
          .startWith(0)
          .switchMap(() => {
            return Observable.fromPromise(this.props.getter()).catch(() => {
              this.setState({
                progress: Progress.Error,
                type: Type.Load
              })
              return Observable.of(null)
            })
          })
          .filter(x => !!x)
          .subscribe(value => {
            this.setState({
              progress: Progress.Normal,
              type: Type.Load,
              value
            })
          })
      )
      const submitObs = this.submitSubject
        .do(() => {
          this.setState({
            progress: Progress.Progressing,
            type: Type.Update
          })
        })
        .switchMap(value => {
          return Observable.fromPromise(this.props.setter(value)).catch(() => {
            this.setState({
              progress: Progress.Error,
              type: Type.Update
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
              progress: Progress.Normal,
              type: Type.Update
            },
            () => {
              if (this.props.onValueSet) this.props.onValueSet(value!)
            }
          )
        })
      )
    }
  }
  export interface ArrayProps<T> {
    itemSetter?: (value: T) => Promise<T>
    getter: () => Promise<T[]>
    childKey?: keyof T
    virtualization?: {
      rowHeight: number
      containerHeight: number
      scrollTop: number
    }
    placeholder?: (progress: Progress) => JSX.Element
    children: (data: T, progress: Progress, setItem: (value: T) => void) => JSX.Element
  }

  export interface ArrayState<T> {
    value: { item: T; progress: Progress; setItem: (value: T) => void }[] | null
    allProgress: Progress
  }

  export class Array<T> extends React.Component<ArrayProps<T>, ArrayState<T>> {
    subscriptions: Subscription[] = []
    itemSubmitSubject = new Subject<{ item: T; idx: number }>()
    loadSubject = new Subject()
    state: ArrayState<T> = {
      allProgress: Progress.Normal,
      value: null
    }
    setItem = (value: T, idx: number) => {
      this.itemSubmitSubject.next({ item: value, idx })
    }
    render() {
      if (this.state.value) {
        if (!this.props.virtualization) {
          return this.state.value.map((value, idx) => (
            <React.Fragment key={this.props.childKey ? value.item[this.props.childKey].toString() : idx.toString()}>
              {this.props.children(value.item, value.progress, value.setItem)}
            </React.Fragment>
          ))
        } else {
          const top = this.props.virtualization.scrollTop
          const firstIndexOnScreen = Math.floor(top / this.props.virtualization!.rowHeight)
          const lastIndexOnScreen =
            Math.ceil(this.props.virtualization.containerHeight / this.props.virtualization.rowHeight) +
            firstIndexOnScreen
          return (
            <React.Fragment>
              <div
                key="top"
                style={{
                  height: firstIndexOnScreen * this.props.virtualization.rowHeight
                }}
              />
              {[...this.state.value].splice(firstIndexOnScreen, lastIndexOnScreen).map((value, idx) => (
                <div
                  key={
                    this.props.childKey
                      ? value.item[this.props.childKey].toString()
                      : firstIndexOnScreen + idx.toString()
                  }
                >
                  {this.props.children(value.item, value.progress, value.setItem)}
                </div>
              ))}
              <div
                key="bottom"
                style={{
                  height: (this.state.value.length - lastIndexOnScreen) * this.props.virtualization.rowHeight
                }}
              />
            </React.Fragment>
          )
        }
      } else {
        return this.props.placeholder ? this.props.placeholder(this.state.allProgress) : null
      }
    }
    componentWillUnmount() {
      this.subscriptions.forEach(s => {
        s.unsubscribe()
      })
    }
    componentDidUpdate(prevProps: ArrayProps<T>) {
      if (this.props.getter !== prevProps.getter) {
        this.loadSubject.next()
      }
    }
    areItemsEqual = (item1: T, idx1: number, item2: T, idx2: number) => {
      if (this.props.childKey) {
        return item1[this.props.childKey] === item2[this.props.childKey]
      } else {
        return idx1 === idx2
      }
    }
    componentDidMount() {
      this.subscriptions.push(
        this.loadSubject
          .startWith(0)
          .do(() => {
            this.setState({
              allProgress: Progress.Progressing
            })
          })
          .startWith(0)
          .switchMap(() => {
            return Observable.fromPromise(this.props.getter()).catch(() => {
              this.setState({
                allProgress: Progress.Error
              })
              return Observable.of(null)
            })
          })
          .filter(x => !!x)
          .subscribe(value => {
            this.setState({
              allProgress: Progress.Normal,
              value: value!.map((v, idx) => {
                return {
                  item: v,
                  progress: Progress.Normal,
                  setItem: (value: T) => {
                    this.setItem(value, idx)
                  }
                }
              })
            })
          })
      )
      this.subscriptions.push(
        this.itemSubmitSubject
          .do(item => {
            this.setState(state => {
              return {
                value: state.value!.map((v, idx) => {
                  if (this.areItemsEqual(item.item, item.idx, v.item, idx)) {
                    return {
                      ...v,
                      progress: Progress.Progressing
                    }
                  }
                  return v
                })
              }
            })
          })
          .flatMap(value => {
            return Observable.fromPromise(this.props.itemSetter!(value.item))
              .map(item => {
                return {
                  idx: value.idx,
                  item
                }
              })
              .catch(() => {
                this.setState(state => {
                  return {
                    value: state.value!.map((v, idx) => {
                      if (this.areItemsEqual(value.item, value.idx, v.item, idx)) {
                        return {
                          ...v,
                          progress: Progress.Error
                        }
                      }
                      return v
                    })
                  }
                })
                return Observable.of(null)
              })
          })
          .filter(x => !!x)
          .subscribe(value => {
            this.setState(state => {
              return {
                value: state.value!.map(
                  (v, idx) =>
                    this.areItemsEqual(value!.item, value!.idx, v.item, idx)
                      ? {
                          item: value!.item,
                          progress: Progress.Normal,
                          setItem: (value: T) => {
                            this.setItem(value, idx)
                          }
                        }
                      : v
                )!
              }
            })
          })
      )
    }
  }
}
