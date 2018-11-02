import { Async } from './Async'
import * as React from 'react'
import { Subscription, Subject, Observable } from 'rxjs'
import * as _ from 'lodash'
const L: any = require('partial.lenses')

export interface ListProps<T> {
  value: T[]
  virtualization?: {
    rowHeight: number
    containerHeight: number
    scrollTop: number
    wrapperComponentClass?: 'div' | 'section' | 'tbody'
    renderAround?: number
  }
  placeholder?: (progress: Async.Progress) => JSX.Element
  childKey: keyof T
  itemUpdater?: (value: T) => Promise<T>
  itemDeleter?: (value: T) => Promise<string>
  onChange?: (value: T[]) => void
  children: (
    data: T,
    setItem: (value: T) => void,
    removeItem: (value: T) => void,
    progress: Async.Progress,
    type: Async.Type
  ) => JSX.Element
}

export interface ListState<T> {
  loadingStates: {
    [key: string]: {
      progress: Async.Progress
      asyncType: Async.Type
    }
  }
}

export class List<T> extends React.Component<ListProps<T>, ListState<T>> {
  subscriptions: Subscription[] = []
  itemSubmitSubject = new Subject<T>()
  itemRemoveSubject = new Subject<T>()
  state: ListState<T> = {
    loadingStates: {}
  }
  removeItem = (value: T) => {
    this.itemRemoveSubject.next(value)
  }
  setItem = (value: T) => {
    this.itemSubmitSubject.next(value)
  }
  render() {
    if (!this.props.virtualization) {
      return this.props.value.map(value => {
        const key = value[this.props.childKey].toString()
        const loadingState = this.state.loadingStates[key] || { progress: Async.Progress.Normal, type: Async.Type.Load }
        return (
          <React.Fragment key={value[this.props.childKey].toString()}>
            {this.props.children(value, this.setItem, this.removeItem, loadingState.progress, loadingState.asyncType)}
          </React.Fragment>
        )
      })
    } else {
      const top = this.props.virtualization.scrollTop
      const renderAround = this.props.virtualization.renderAround ? this.props.virtualization.renderAround : 5
      const firstIndexOnScreen = Math.max(Math.floor(top / this.props.virtualization!.rowHeight) - renderAround, 0)
      const lastIndexOnScreen = Math.min(
        Math.ceil(this.props.virtualization.containerHeight / this.props.virtualization.rowHeight) +
          firstIndexOnScreen +
          renderAround * 2,
        this.props.value.length
      )
      const firstBlockHeight = firstIndexOnScreen * this.props.virtualization.rowHeight
      const lastBlockHeight = (this.props.value.length - lastIndexOnScreen) * this.props.virtualization.rowHeight
      if (this.props.virtualization.wrapperComponentClass === 'tbody') {
        return (
          <tbody>
            <tr style={{ height: firstBlockHeight }} />
            {this.props.value.slice(firstIndexOnScreen, lastIndexOnScreen).map(value => {
              const key = value[this.props.childKey].toString()
              const loadingState = this.state.loadingStates[key] || {
                progress: Async.Progress.Normal,
                type: Async.Type.Load
              }
              return (
                <React.Fragment key={value[this.props.childKey].toString()}>
                  {this.props.children(
                    value,
                    this.setItem,
                    this.removeItem,
                    loadingState.progress,
                    loadingState.asyncType
                  )}
                </React.Fragment>
              )
            })}
            <tr style={{ height: lastBlockHeight }} />
          </tbody>
        )
      } else {
        return React.createElement(
          this.props.virtualization.wrapperComponentClass || 'div',
          {
            style: {
              paddingTop: firstBlockHeight,
              paddingBottom: lastBlockHeight
            }
          },
          this.props.value.slice(firstIndexOnScreen, lastIndexOnScreen).map(value => {
            const key = value[this.props.childKey].toString()
            const loadingState = this.state.loadingStates[key] || {
              progress: Async.Progress.Normal,
              type: Async.Type.Load
            }
            return (
              <React.Fragment key={value[this.props.childKey].toString()}>
                {this.props.children(
                  value,
                  this.setItem,
                  this.removeItem,
                  loadingState.progress,
                  loadingState.asyncType
                )}
              </React.Fragment>
            )
          })
        )
      }
    }
  }
  componentWillUnmount() {
    this.subscriptions.forEach(s => {
      s.unsubscribe()
    })
  }
  componentDidMount() {
    this.subscriptions.push(
      this.itemSubmitSubject
        .do(value => {
          const key = value![this.props.childKey].toString()
          this.setState(state => {
            const s = L.set(['loadingStates', key, 'progress'], Async.Progress.Progressing, state)
            return L.set(['loadingStates', key, 'type'], Async.Type.Update, s)
          })
        })
        .flatMap(value => {
          const key = value![this.props.childKey].toString()
          return Observable.fromPromise(this.props.itemUpdater!(value)).catch(() => {
            this.setState(state => {
              const s = L.set(['loadingStates', key, 'progress'], Async.Progress.Error, state)
              return L.set(['loadingStates', key, 'type'], Async.Type.Update, s)
            })
            return Observable.of(null)
          })
        })
        .filter(x => !!x)
        .subscribe(value => {
          const key = value![this.props.childKey].toString()
          this.setState(
            state => {
              const s = L.set(['loadingStates', key, 'progress'], Async.Progress.Done, state)
              return L.set(['loadingStates', key, 'type'], Async.Type.Update, s)
            },
            () => {
              if (this.props.onChange) {
                this.props.onChange(
                  this.props.value.map(item => (item[this.props.childKey].toString() === key ? value! : item))
                )
              }
            }
          )
        })
    )
    this.subscriptions.push(
      this.itemRemoveSubject
        .do(value => {
          const key = value![this.props.childKey].toString()
          this.setState(state => {
            const s = L.set(['loadingStates', key, 'progress'], Async.Progress.Progressing, state)
            return L.set(['loadingStates', key, 'type'], Async.Type.Delete, s)
          })
        })
        .flatMap(value => {
          const key = value![this.props.childKey].toString()
          return Observable.fromPromise(this.props.itemDeleter!(value)).catch(() => {
            this.setState(state => {
              const s = L.set(['loadingStates', key, 'progress'], Async.Progress.Error, state)
              return L.set(['loadingStates', key, 'type'], Async.Type.Delete, s)
            })
            return Observable.of(null)
          })
        })
        .filter(x => !!x)
        .subscribe(removedItem => {
          const key = removedItem
          this.setState(
            state => {
              const s = L.set(['loadingStates', key, 'progress'], Async.Progress.Done, state)
              return L.set(['loadingStates', key, 'type'], Async.Type.Delete, s)
            },
            () => {
              if (this.props.onChange) {
                this.props.onChange(this.props.value.filter(item => item[this.props.childKey].toString() !== key))
              }
            }
          )
        })
    )
  }
}
