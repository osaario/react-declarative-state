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
  childKey: keyof T
  onValueChanged?: (value: Promise<T[]>) => void
  children: (
    data: T,
    setItem: (value: Promise<T>) => void,
    removeItem: (value: Promise<string>) => void,
    progress: Async.Progress,
    type: Async.Type
  ) => JSX.Element
}

export interface ListState<T> {
  value:
    | {
        item: T
        progress: Async.Progress
        asyncType: Async.Type
        setItem: (value: Promise<T>) => void
        removeItem: (value: Promise<string>) => void
      }[]
    | null
  allProgress: Async.Progress
}

export class List<T> extends React.Component<ListProps<T>, ListState<T>> {
  subscriptions: Subscription[] = []
  itemSubmitSubject = new Subject<{ item: Promise<T>; key: string }>()
  itemRemoveSubject = new Subject<{ item: Promise<string>; key: string }>()
  loadSubject = new Subject()
  state: ListState<T> = {
    allProgress: Async.Progress.Normal,
    value: null
  }
  removeItem = (value: Promise<string>, key: string) => {
    this.itemRemoveSubject.next({ item: value, key })
  }
  setItem = (value: Promise<T>, key: string) => {
    this.itemSubmitSubject.next({ item: value, key })
  }
  render() {
    if (this.state.value) {
      if (!this.props.virtualization) {
        return this.state.value.map(value => (
          <React.Fragment key={value.item[this.props.childKey].toString()}>
            {this.props.children(value.item, value.setItem, value.removeItem, value.progress, value.asyncType)}
          </React.Fragment>
        ))
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
              {this.state.value.slice(firstIndexOnScreen, lastIndexOnScreen).map(value => (
                <React.Fragment key={value.item[this.props.childKey].toString()}>
                  {this.props.children(value.item, value.setItem, value.removeItem, value.progress, value.asyncType)}
                </React.Fragment>
              ))}
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
              .map(value => (
                <React.Fragment key={value.item[this.props.childKey].toString()}>
                  {this.props.children(value.item, value.setItem, value.removeItem, value.progress, value.asyncType)}
                </React.Fragment>
              ))
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
  onValueChanged = () => {
    if (this.props.onValueChanged) this.props.onValueChanged(Promise.resolve(this.state.value!.map(v => v.item)))
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
            value: value!.map(v => {
              return {
                item: v,
                progress: Async.Progress.Normal,
                asyncType: Async.Type.Load,
                setItem: (value: Promise<T>) => {
                  this.setItem(value, v[this.props.childKey].toString())
                },
                removeItem: (value: Promise<string>) => {
                  this.removeItem(value, v[this.props.childKey].toString())
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
              value: state.value!.map(v => {
                if (item.key === v.item[this.props.childKey].toString()) {
                  return {
                    ...v,
                    progress: Async.Progress.Progressing,
                    type: Async.Type.Update
                  }
                }
                return v
              })
            }
          })
        })
        .flatMap(value => {
          return Observable.fromPromise(value.item).catch(() => {
            this.setState(state => {
              return {
                value: state.value!.map(v => {
                  if (value.key === v.item[this.props.childKey].toString()) {
                    return {
                      ...v,
                      progress: Async.Progress.Error,
                      type: Async.Type.Update
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
                v =>
                  v.item[this.props.childKey].toString() === value![this.props.childKey].toString()
                    ? {
                        item: value!,
                        progress: Async.Progress.Normal,
                        asyncType: Async.Type.Update,
                        setItem: (value: Promise<T>) => {
                          this.setItem(value, v.item[this.props.childKey].toString())
                        },
                        removeItem: (value: Promise<string>) => {
                          this.removeItem(value, v.item[this.props.childKey].toString())
                        }
                      }
                    : v
              )!
            }
          }, this.onValueChanged)
        })
    )
    this.subscriptions.push(
      this.itemRemoveSubject
        .do(item => {
          this.setState(state => {
            return {
              value: state.value!.map(v => {
                if (item.key === v.item[this.props.childKey].toString()) {
                  return {
                    ...v,
                    progress: Async.Progress.Progressing,
                    type: Async.Type.Delete
                  }
                }
                return v
              })
            }
          })
        })
        .flatMap(value => {
          return Observable.fromPromise(value.item).catch(() => {
            this.setState(state => {
              return {
                value: state.value!.map(v => {
                  if (value.key === v.item[this.props.childKey].toString()) {
                    return {
                      ...v,
                      progress: Async.Progress.Error,
                      type: Async.Type.Delete
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
        .subscribe(removedItem => {
          console.log({ removedItem })
          this.setState(state => {
            return {
              value: state
                .value!.filter(v => {
                  return v.item[this.props.childKey].toString() !== removedItem!.toString()
                })
                .map((v, idx) => {
                  return {
                    ...v,
                    item: v.item,
                    progress: Async.Progress.Normal,
                    setItem: (value: Promise<T>) => {
                      this.setItem(value, v.item[this.props.childKey].toString())
                    },
                    removeItem: (value: Promise<string>) => {
                      this.removeItem(value, v.item[this.props.childKey].toString())
                    }
                  }
                })
            }
          }, this.onValueChanged)
        })
    )
  }
}
