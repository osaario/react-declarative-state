export namespace Async {
  export enum Type {
    Load = 1,
    Create,
    Update,
    Delete
  }

  export enum Progress {
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
    return progress === Progress.Progressing && type === Type.Load
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
}
