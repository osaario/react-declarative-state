[![Stable Release](https://img.shields.io/npm/v/react-declarative-state.svg)](https://npm.im/declarative-state)
[![license](https://badgen.now.sh/badge/license/MIT)](./LICENSE)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

# React Declarative State Components

Create performant and coherent asynchronous UI:s with ease. It's also fun.

Works with RxJS 5 Observables.

## Installation

```
npm install react-declarative-state
```

## Components

This library provides 4 basic components to deal with different common scenarios that need asynchronous logic.

### Constant

`Constant` resolves the value of provided `Observable` and renders the result of the provided children function after the value is resolved. When no value has yet been resolved or there is an error, placeholder is rendered if provided.

```JSX
import React from "react"
import { Constant, Async } from "react-declarative-state"

const App = () => (
  <Constant
    value={Async.GET("https://jsonplaceholder.typicode.com/todos/1")}
    placeholder={progress => (progress === Async.Progress.Error ? <label>Error</label> : <label>Loading...</label>)}
  >
    {({ title, completed }) => (
      <label>
        {title} <input type="checkbox" checked={completed} />
      </label>
    )}
  </Constant>
)
```

### Variable

Like `Constant`, `Variable` also resolves the `initialValue` and renders the result of children function after the `initialValue` is resolved. Similiarly, when no value has yet been resolved or there is an error, placeholder is rendered if provided. New value can be provided as an `Observable` or concrete value to the *function* provided as the second argument for the children function. While that new value is being resolved the third argument provided will show the progress of the operation.

```JSX
import { Variable, Async } from "react-declarative-state"

const App = () => (
  <Variable
    initialValue={Async.GET("https://jsonplaceholder.typicode.com/todos/1")}
    placeholder={progress => (progress === Async.Progress.Error ? <label>Error</label> : <label>Loading...</label>)}
  >
    {({ title, completed, id }, setTodo, progress) => (
      <div>
        <label>
          {title} <input type="checkbox" checked={completed} />
        </label>
        <button
          disabled={progress === Async.Progress.Loading}
          onClick={() => {
            setTodo(Async.GET(`https://jsonplaceholder.typicode.com/todos/${id + 1}`))
          }}
        >
          Next
        </button>
      </div>
    )}
  </Variable>
)
```

### Controlled

Otherwise similiar to the `Variable` component the subsequent values of `Controlled` component is passed as a prop instead of being determined in the *children*. It's handy for f.ex. scrolling through content or implementing search functionality. The change in `controlKey` will inform the component that a new value needs to be resolved.

```JSX
import { Controlled, Async, Variable } from "react-declarative-state"

const App = () => (
  <Variable initialValue={1}>
    {(todoId, setTodoId) => (
      <div>
        <Controlled
          debounceTime={200}
          controlKey={todoId}
          value={Async.GET(`https://jsonplaceholder.typicode.com/todos/${todoId}`)}
          placeholder={progress =>
            progress === Async.Progress.Error ? <label>Error</label> : <label>Loading...</label>
          }
        >
          {({ title, completed }, progress) => (
            <div style={{ opacity: progress === Async.Progress.Progressing ? 0.5 : 1 }}>
              <label>
                {title} <input type="checkbox" checked={completed} />
              </label>
            </div>
          )}
        </Controlled>
        <br />
        <button
          onClick={() => {
            setTodoId(todoId + 1)
          }}
        >
          Next
        </button>
      </div>
    )}
  </Variable>
)
```

Example also demonstrates how all the components (`Variable` in this example) can also be provided with concrete values instead of async ones (`Observables`). Handy in making nested "state" in components with deep UI trees.

### Operation

Different from the other components `Operation` does not hold a value at all. It provides the *children* a function that can be called with an *async* operation (`Observable`). It then resolves the value of the operation and provides progress to children function while progressing. It calls `onDone` prop function with the result when done.

```JSX
import { Operation, Async, Variable } from "react-declarative-state"

const App = () => (
  <Operation
    onDone={({ token }) => {
      // Trigger navigation to landing page or something...
      alert(`Logged in with token: ${token}`)
    }}
  >
    {(doOperation, progress) => (
      <Variable initialValue={{ password: "", email: "" }}>
        {({ email, password }, setLogin) => (
          <form
            onSubmit={e => {
              e.preventDefault()
              doOperation(Async.POST("https://reqres.in/api/login", { email, password }))
            }}
          >
            <input
              type="email"
              value={email}
              onChange={e => {
                setLogin({ email: e.target.value, password })
              }}
              placeholder="Email"
            />
            <input
              type="password"
              value={password}
              onChange={e => {
                setLogin({ password: e.target.value, email })
              }}
              placeholder="Password"
            />
            <button disabled={progress === Async.Progress.Progressing} type="submit">
              Login
            </button>
          </form>
        )}
      </Variable>
    )}
  </Operation>
)
```

## Examples

### Async TodoMVC

Implementation of the legendary TodoMVC (this does not look as good), but instead of synchronous, against a REST API (Mocked in the example).

```JSX
import React, { Fragment } from "react"
import { Variable, Async, Operation } from "react-declarative-state"
import { Observable } from "rxjs"

/* AWESOME MOCK REST BACKEND */

let todos = []
let ID = 1

const PUT = todo => {
  return Observable.of(0)
    .delay(200)
    .do(() => {
      todos = todos.map(t => (todo.id === t.id ? todo : t))
    })
    .map(() => todo)
}

const POST = todo => {
  let newTodo = { ...todo, id: ID }
  ID += 1
  return Observable.of(0)
    .delay(100)
    .do(() => {
      todos = todos.concat([newTodo])
    })
    .map(() => newTodo)
}

const DELETE = id => {
  return Observable.of(0)
    .delay(100)
    .do(() => {
      todos = todos.filter(t => t.id !== id)
    })
    .map(() => 204)
}

const SETALL = newTodos => {
  return Observable.of(0)
    .delay(300)
    .do(() => {
      todos = newTodos
    })
    .map(() => todos)
}

const GETALL = () => {
  return Observable.of(0)
    .delay(200)
    .map(() => todos)
}

const TodoApp = () => (
  <Variable initialValue={GETALL()}>
    {(todos, setTodos, progress) => (
      <div style={{ padding: 15, opacity: progress === Async.Progress.Progressing ? 0.5 : 1 }}>
        <h1>Todos</h1>
        <Variable initialValue={"all"}>
          {(tab, setTab) => (
            <Fragment>
              <nav>
                <a
                  style={{ color: tab === "all" && "green" }}
                  onClick={() => {
                    setTab("all")
                  }}
                >
                  All
                </a>
                <a
                  style={{ color: tab === "active" && "green" }}
                  onClick={() => {
                    setTab("active")
                  }}
                >
                  Active
                </a>
                <a
                  style={{ color: tab === "complete" && "green" }}
                  onClick={() => {
                    setTab("complete")
                  }}
                >
                  Complete
                </a>
                <button
                  onClick={() => {
                    const allTrue = todos.filter(todo => todo.complete).length === todos.length
                    setTodos(
                      SETALL(
                        todos.map(todo => {
                          return {
                            ...todo,
                            complete: !allTrue
                          }
                        })
                      )
                    )
                  }}
                >
                  Toggle
                </button>
              </nav>
              <Operation
                onDone={todo => {
                  setTodos(GETALL())
                }}
              >
                {(doOperation, progress) => (
                  <input
                    disabled={progress === Async.Progress.Progressing}
                    placeholder="What needs to be done"
                    onKeyDown={e => {
                      if (e.keyCode === 13) {
                        doOperation(POST({ title: e.target.value, complete: false }))
                        e.target.value = ""
                      }
                    }}
                  />
                )}
              </Operation>
              <ul>
                {todos
                  .filter(
                    todo =>
                      tab === "all" || (tab === "complete" && todo.complete) || (tab === "active" && !todo.complete)
                  )
                  .map((todo, idx) => (
                    <li key={todo.id}>
                      <Operation
                        onDone={todo => {
                          setTodos(GETALL())
                        }}
                      >
                        {(doOperation, progress) => (
                          <Fragment>
                            <input
                              disabled={progress === Async.Progress.Progressing}
                              type="checkbox"
                              onChange={e => {
                                doOperation(PUT({ ...todo, complete: e.target.checked }))
                              }}
                              checked={todo.complete}
                            />
                            <input
                              disabled={progress === Async.Progress.Progressing}
                              defaultValue={todo.title}
                              onKeyDown={e => {
                                if (e.keyCode === 13) {
                                  doOperation(PUT({ ...todo, title: e.target.value }))
                                }
                              }}
                            />
                            {progress !== Async.Progress.Progressing && (
                              <span
                                style={{ color: "red", marginLeft: 15 }}
                                onClick={() => {
                                  doOperation(DELETE(todo.id))
                                }}
                              >
                                X
                              </span>
                            )}
                          </Fragment>
                        )}
                      </Operation>
                    </li>
                  ))}
              </ul>
              <footer>
                {todos.filter(todo => !todo.complete).length} items left{" "}
                <button
                  onClick={() => {
                    setTodos(SETALL(todos.filter(todo => !todo.complete)))
                  }}
                >
                  Clear completed
                </button>
              </footer>
            </Fragment>
          )}
        </Variable>
      </div>
    )}
  </Variable>
)
export default TodoApp
```




