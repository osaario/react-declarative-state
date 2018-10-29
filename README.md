# Declarative Components

Declarative JSX components developed for Timma SaaS client codebase

## Installation

```
npm install declarative-components
```

## Examples

### DataTable

```JSX
import React, { Fragment } from "react"

import { DataTable, Sync, Async } from "declarative-components"
const colors = ["red", "green", "blue", "yellow"] as ("red" | "green" | "blue" | "yellow")[]

interface Photo {
  albumId: number
  id: number
  title: string
  url: string
  thumbnailUrl: string
}

class App extends React.Component {
  public render() {
    return (
      <Async.Const
        placeholder={progress => {
          if (progress === Async.Progress.Progressing) {
            return <div>Progressing...</div>
          } else {
            return <div style={{ color: "red" }}>Error happened</div>
          }
        }}
        value={Async.GET<Photo[]>("https://jsonplaceholder.typicode.com/photos")}
      >
        {photos => (
          <Sync.Var initialValue={colors[0]}>
            {(color, setColor) => (
              <Fragment>
                <nav>
                  <select
                    value={color}
                    onChange={(e: any) => {
                      setColor(e.target.value)
                    }}
                  >
                    {colors.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </nav>
                <DataTable data={photos} rowHeight={18} anticipateRows={70} initialSortField={"title"}>
                  {({ THead, TBody, Sort }, queryString, setQueryString) => {
                    return (
                      <table>
                        <input
                          placeholder="search"
                          value={queryString}
                          onChange={(e: any) => {
                            setQueryString(e.target.value)
                          }}
                        />
                        <THead>
                          <tr style={{ color }}>
                            <Sort field="title">
                              {(sortDirection, toggleSort) => (
                                <th
                                  style={{ textAlign: "left", cursor: "pointer", whiteSpace: "nowrap" }}
                                  onClick={toggleSort}
                                >
                                  Title {sortDirection === "desc" ? "⬇" : sortDirection === "asc" ? "⬆" : "⬍"}
                                </th>
                              )}
                            </Sort>
                            <th style={{ textAlign: "left" }}>id</th>
                            <th style={{ textAlign: "left" }}>AlbumId</th>
                            <th>Url</th>
                          </tr>
                        </THead>
                        <TBody>
                          {photo => (
                            <Fragment>
                              <DataTable.Td>{photo.title}</DataTable.Td>
                              <DataTable.Td>{photo.id}</DataTable.Td>
                              <DataTable.Td>{photo.albumId}</DataTable.Td>
                              <DataTable.Td>{photo.url}</DataTable.Td>
                            </Fragment>
                          )}
                        </TBody>
                      </table>
                    )
                  }}
                </DataTable>
              </Fragment>
            )}
          </Sync.Var>
        )}
      </Async.Const>
    )
  }
}
```

### Form

Form is a controlled component that calls onChange on every form submit. Form supports validation.

```JSX
import React, { Fragment } from "react"
import { Form, Async, Sync } from "declarative-components"

interface Post {
  userId: number
  id: number
  title: string
  body: string
}

class App extends React.Component {
  public render() {
    return (
      <Sync.Guard initialValue={"edit" as "edit" | "done"}>
        {(Tab, setValue) => (
          <Fragment>
            <Tab name="edit">
              <Async.Var
                onChange={() => {
                  setTimeout(() => {
                    setValue("done")
                  }, 2000)
                }}
                placeholder={progress => {
                  if (progress === Async.Progress.Progressing) {
                    return <div>Loading...</div>
                  } else {
                    return <div style={{ color: "red" }}>Error happened</div>
                  }
                }}
                setter={value => {
                  if (value) {
                    return {
                      operation: Async.PUT<Async.Model.Incomplete<Post>>(
                        "https://jsonplaceholder.typicode.com/posts/1",
                        value
                      ),
                      type: Async.Type.Update
                    }
                  } else {
                    return {
                      operation: Async.DELETE(`https://jsonplaceholder.typicode.com/posts/1`),
                      type: Async.Type.Delete
                    }
                  }
                }}
                initialValue={Async.GET<Post>("https://jsonplaceholder.typicode.com/posts/1")}
              >
                {(post, asyncState, setValue) => (
                  <p style={{ opacity: asyncState.progress === Async.Progress.Progressing ? 0.5 : 1 }}>
                    <Sync.Var initialValue={5}>
                      {(minLength, setMinLength) => (
                        <Fragment>
                          <p>
                            <label>Set min length</label>
                            <input
                              type="number"
                              value={minLength}
                              onChange={(e: any) => {
                                setMinLength(e.target.value)
                              }}
                            />
                          </p>
                          <Form
                            value={post}
                            onChange={value => {
                              setValue(value)
                            }}
                          >
                            {({ Root, SubmitButton }) => (
                              <Fragment>
                                <Root>
                                  {({ Validated, Input, TextArea }) => (
                                    <Fragment>
                                      <Validated name="title">
                                        {validation => (
                                          <div style={{ color: validation ? "red" : undefined }}>
                                            <label>Title</label>
                                            <Input notEmpty={true} minLength={minLength} name="title" />
                                            {validation && (
                                              <span>
                                                Violates rule: {validation.ruleName} {validation.ruleValue.toString()}
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </Validated>
                                      <Validated name="body">
                                        {validation => (
                                          <div style={{ color: validation ? "red" : undefined }}>
                                            <label>Body</label>
                                            <TextArea notEmpty={true} rows={5} name="body" />
                                          </div>
                                        )}
                                      </Validated>
                                    </Fragment>
                                  )}
                                </Root>
                                <SubmitButton asyncDataType={Async.Type.Update} progress={Async.Progress.Normal} />
                              </Fragment>
                            )}
                          </Form>
                        </Fragment>
                      )}
                    </Sync.Var>
                  </p>
                )}
              </Async.Var>
            </Tab>
            <Tab name="done">
              <p>Edit success</p>
            </Tab>
          </Fragment>
        )}
      </Sync.Guard>
    )
  }
}
```

## Acknowledgements

Library boilerplate starter: https://github.com/alexjoverm/typescript-library-starter

## Dependencies
