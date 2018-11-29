import { Observable } from 'rxjs'
const symbolObservable = require('symbol-observable').default

// from https://github.com/sindresorhus/is-observable/blob/master/index.js, exports const so:

const isObservable = (value: any) => Boolean(value && value[symbolObservable] && value === value[symbolObservable]())

export function isAsync<T>(value: Observable<T> | T) {
  return isObservable(value)
}

export function createObservable<T>(value: Observable<T> | T): Observable<T> {
  if (isObservable(value)) return value as any
  else {
    throw Error('Passed operation is not an RxJS Observable or Promise')
  }
}
