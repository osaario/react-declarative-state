import { Observable } from 'rxjs'

export namespace Async {
  /** Type of asynchronous operation */
  export enum Type {
    Load = 1,
    Create,
    Update,
    Delete
  }

  /** Progress of asynchronous operation */
  export enum Progress {
    Normal = 1,
    Progressing,
    Done,
    Error
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
    return progress === Progress.Progressing && type === Type.Load
  }

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json'
  }

  export function GET<T>(url: string, headers?: HeadersInit): Observable<T> {
    return Observable.of(0).switchMap(() =>
      fetch(url, {
        method: 'GET',
        headers: headers ? { ...headers } : { ...defaultHeaders }
      }).then(response => {
        if (response.ok) {
          return response.json()
        }
        throw Error(response.status.toString())
      })
    )
  }

  export function DELETE(url: string, headers?: HeadersInit): Observable<number> {
    return Observable.of(0).switchMap(() =>
      fetch(url, {
        method: 'DELETE',
        headers: headers ? { ...headers } : { ...defaultHeaders }
      }).then(response => {
        if (response.ok) {
          return response.status
        }
        throw Error(response.status.toString())
      })
    )
  }

  export function POST<T>(url: string, data: T, headers?: HeadersInit) {
    return Observable.of(0).switchMap(() =>
      fetch(url, {
        method: 'POST',
        headers: headers ? { ...headers } : { ...defaultHeaders },
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

  export function PUT<T>(url: string, data: T, headers?: HeadersInit) {
    return Observable.of(0).switchMap(() =>
      fetch(url, {
        method: 'PUT',
        headers: headers ? { ...headers } : { ...defaultHeaders },
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
}
