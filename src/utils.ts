import { Observable } from 'rxjs'
const isObservable = require('is-observable')
const isPromise = require('is-promise')

export type DCValueType<T> = T | Observable<T> | Promise<T>

export function createObservable<T>(value: DCValueType<T>): Observable<T> {
  if (isPromise(value)) return Observable.fromPromise(value as any)
  else if (isObservable(value)) return value as any
  else return Observable.of(value) as any
}
