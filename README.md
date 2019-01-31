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
import { Constant, Async } from "declarative-components"

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
import { Variable, Async } from "declarative-components"

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

