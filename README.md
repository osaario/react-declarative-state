[![Stable Release](https://img.shields.io/npm/v/react-declarative-state.svg)](https://npm.im/declarative-state)
[![license](https://badgen.now.sh/badge/license/MIT)](./LICENSE)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

# React Declarative State Components

Create performant and coherent asynchronous UI:s with ease. It's also fun.

## Installation

```
npm install react-declarative-state
```

## Components

This library provides 4 basic components to deal with different common scenarios that need asynchronous logic.

### Constant

`Constant` resolves a value and renders the result of the provided children function after the value is resolved. When no value has yet been resolved or there is an error, placeholder is rendered if provided.

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

Like `Constant`, `Variable` also resolves the `initialValue` and renders the result of children function after the `initialValue` is resolved. Similiarly, when no value has yet been resolved or there is an error, placeholder is rendered if provided. New value can be provided as an `Observable` or concrete value to the second argument of the children function. While that new value is being resolved the third argument will show the progress of the operation.

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

Different from the other components `Operation` does not hold a value at all. It just provides the *children* a function that can be called with an *async* operation (`Observable`) with progress of the operation. It calls `onDone` prop function with the result after operation is resolved.

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

To be implemented...





