import { Async } from './Async'
import * as React from 'react'
import { Subscription, Subject, Observable } from 'rxjs'

export interface ListProps<T> {
  initialValue: Promise<T[]>
  virtualization?: {
    rowHeight: number
    containerHeight: number
    scrollTop: number
    wrapperComponentClass?: 'div' | 'section' | 'tbody'
    renderAround?: number
  }
  placeholder?: (progress: Async.Progress) => JSX.Element
  children: (data: T, progress: Async.Progress, setItem: (value: Promise<T>) => void) => JSX.Element
}

export interface ListState<T> {
  value: { item: T; progress: Async.Progress; setItem: (value: Promise<T>) => void }[] | null
  allProgress: Async.Progress
}

export class List<T> extends React.Component<ListProps<T>, ListState<T>> {
  subscriptions: Subscription[] = []
  itemSubmitSubject = new Subject<{ item: Promise<T>; idx: number }>()
  loadSubject = new Subject()
  state: ListState<T> = {
    allProgress: Async.Progress.Normal,
    value: null
  }
  setItem = (value: Promise<T>, idx: number) => {
    this.itemSubmitSubject.next({ item: value, idx })
  }
  render() {
    if (this.state.value) {
      if (!this.props.virtualization) {
        return this.state.value.map(value => this.props.children(value.item, value.progress, value.setItem))
      } else {
        const top = this.props.virtualization.scrollTop
        const renderAround = this.props.virtualization.renderAround ? this.props.virtualization.renderAround : 5
        const firstIndexOnScreen = Math.max(Math.floor(top / this.props.virtualization!.rowHeight) - renderAround, 0)
        const lastIndexOnScreen = Math.min(
          Math.ceil(this.props.virtualization.containerHeight / this.props.virtualization.rowHeight) +
            firstIndexOnScreen +
            renderAround * 2,
          this.state.value.length
        )
        const firstBlockHeight = firstIndexOnScreen * this.props.virtualization.rowHeight
        const lastBlockHeight = (this.state.value.length - lastIndexOnScreen) * this.props.virtualization.rowHeight
        if (this.props.virtualization.wrapperComponentClass === 'tbody') {
          return (
            <tbody>
              <tr style={{ height: firstBlockHeight }} />
              {this.state.value
                .slice(firstIndexOnScreen, lastIndexOnScreen)
                .map(value => this.props.children(value.item, value.progress, value.setItem))}
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
            this.state.value
              .slice(firstIndexOnScreen, lastIndexOnScreen)
              .map(value => this.props.children(value.item, value.progress, value.setItem))
          )
        }
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
  componentDidMount() {
    this.subscriptions.push(
      this.loadSubject
        .startWith(0)
        .do(() => {
          this.setState({
            allProgress: Async.Progress.Progressing
          })
        })
        .startWith(0)
        .switchMap(() => {
          return Observable.fromPromise(this.props.initialValue).catch(() => {
            this.setState({
              allProgress: Async.Progress.Error
            })
            return Observable.of(null)
          })
        })
        .filter(x => !!x)
        .subscribe(value => {
          this.setState({
            allProgress: Async.Progress.Normal,
            value: value!.map((v, idx) => {
              return {
                item: v,
                progress: Async.Progress.Normal,
                setItem: (value: Promise<T>) => {
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
                if (item.idx === idx) {
                  return {
                    ...v,
                    progress: Async.Progress.Progressing
                  }
                }
                return v
              })
            }
          })
        })
        .flatMap(value => {
          return Observable.fromPromise(value.item)
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
                    if (value.idx === idx) {
                      return {
                        ...v,
                        progress: Async.Progress.Error
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
                  idx === value!.idx
                    ? {
                        item: value!.item,
                        progress: Async.Progress.Normal,
                        setItem: (value: Promise<T>) => {
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
