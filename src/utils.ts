import { Observable } from 'rxjs'
const isPromise = require('is-promise')
const symbolObservable = require('symbol-observable').default

// from https://github.com/sindresorhus/is-observable/blob/master/index.js, exports const so:

const isObservable = (value: any) => Boolean(value && value[symbolObservable] && value === value[symbolObservable]())

export type DCValueType<T> = T | Observable<T> | Promise<T>

export function createObservable<T>(value: DCValueType<T>): Observable<T> {
  if (isPromise(value)) return Observable.fromPromise(value as any)
  else if (isObservable(value)) return value as any
  else return Observable.of(value) as any
}
