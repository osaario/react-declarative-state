import { Observable } from 'rxjs'
const isPromise = require('is-promise')
const symbolObservable = require('symbol-observable').default

// from https://github.com/sindresorhus/is-observable/blob/master/index.js, exports const so:

const isObservable = (value: any) => Boolean(value && value[symbolObservable] && value === value[symbolObservable]())

export type DCValueType<T> = T | Observable<T> | Promise<T>

export function isAsync<T>(value: DCValueType<T>) {
  return isPromise(value) || isObservable(value)
}

export function createObservable<T>(value: DCValueType<T>): Observable<T> {
  if (isPromise(value)) return Observable.fromPromise(value as any)
  else if (isObservable(value)) return value as any
  else {
    throw Error('Passed operation is not an RxJS Observable or Promise')
  }
}
