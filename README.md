# Declarative Components

Declarative JSX components developed for Timma SaaS client codebase

## Acknowledgements

Library boilerplate starter: https://github.com/alexjoverm/typescript-library-starter

## Dependencies

## Examples

### DataTable

```
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
        value={() => {
          return Async.GET<Photo[]>("https://jsonplaceholder.typicode.com/photos")
        }}
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
                  {(__, { THead, TBody, Sort }) => {
                    return (
                      <Fragment>
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
                      </Fragment>
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

```
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
      <Async.Const
        placeholder={progress => {
          if (progress === Async.Progress.Progressing) {
            return <div>Progressing...</div>
          } else {
            return <div style={{ color: "red" }}>Error happened</div>
          }
        }}
        value={() => {
          return Async.GET<Post>("https://jsonplaceholder.typicode.com/posts/1")
        }}
      >
        {initialPost => (
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
                  initialValue={initialPost}
                  onSubmit={() => {
                    alert("Submitted")
                  }}
                >
                  {({ Root, SubmitButton }) => (
                    <Fragment>
                      <Root>
                        {({ Validated, Input, TextArea }) => (
                          <Fragment>
                            <div>
                              <label>Id</label>
                              <Input name="id" />
                            </div>
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
        )}
      </Async.Const>
    )
  }
}
```
