# Declarative Components

Declarative JSX components developed for Timma SaaS client codebase.

## Installation

```
npm install declarative-components
```

## Why?

Easily compose complex UI:s with declarative components. Instead of storing the state in the component the state is stored internally inside the declarative components. This way a change to variable is reflected only to children without the need to re-render the whole root component.

```JSX
import { Async, Sync } from "declarative-components"

class App extends React.Component {
  public render() {
    return (
      <div>
        <h1>Welcome to my photos</h1>
        <Async.Const value={Async.GET<Photo[]>("https://jsonplaceholder.typicode.com/photos")}>
          {photos => (
            <div>
              <h2>I have {photos.length} photos in total</h2>
              <Sync.Var initialValue={10}>
                {(numberOfPhotos, setNumberOfPhotos) => (
                  <Fragment>
                    <div>
                      <button
                        onClick={() => {
                          setNumberOfPhotos(numberOfPhotos - 1)
                        }}
                      >
                        -
                      </button>
                      <button
                        onClick={() => {
                          setNumberOfPhotos(numberOfPhotos + 1)
                        }}
                      >
                        +
                      </button>
                    </div>
                    {photos.slice(0, numberOfPhotos).map(photo => (
                      <Sync.Var key={photo.id} initialValue={100}>
                        {(width, setWidth) => (
                          <img
                            onClick={() => {
                              setWidth(width + 10)
                            }}
                            width={width}
                            src={photo.url}
                          />
                        )}
                      </Sync.Var>
                    ))}
                  </Fragment>
                )}
              </Sync.Var>
            </div>
          )}
        </Async.Const>
      </div>
    )
  }
}
```

To accomplish this kind of behavior in the traditional React style we would have to create stateful subcomponents for rendering the photo and also for rendering the list.

```JSX
import { Async } from "declarative-components"

class Photo extends React.Component<{ src: string; initialWidth: number }, { width: number }> {
  state = {
    width: this.props.initialWidth
  }
  increaseWidth = () => {
    this.setState(({ width }) => {
      return {
        width: width + 10
      }
    })
  }
  render() {
    return <img onClick={this.increaseWidth} width={this.state.width} src={this.props.src} />
  }
}
class PhotoList extends React.Component<
  { initialNumberOfPhotos: number; photos: Photo[] },
  { numberOfPhotos: number }
> {
  state = {
    numberOfPhotos: this.props.initialNumberOfPhotos
  }
  increaseNumberOfPhotos = () => {
    this.setState(({ numberOfPhotos }) => {
      return {
        numberOfPhotos: numberOfPhotos + 1
      }
    })
  }
  decreaseNumberOfPhotos = () => {
    this.setState(({ numberOfPhotos }) => {
      return {
        numberOfPhotos: numberOfPhotos - 1
      }
    })
  }
  render() {
    return (
      <div>
        <button onClick={this.decreaseNumberOfPhotos}>-</button>
        <button onClick={this.increaseNumberOfPhotos}>+</button>
        {this.props.photos.slice(0, this.state.numberOfPhotos).map(photo => (
          <Photo src={photo.url} initialWidth={100} />
        ))}
      </div>
    )
  }
}

class App extends React.Component<{}, { photos: Photo[] | null }> {
  subscriptions: Subscription[] = []
  state: { photos: Photo[] | null } = { photos: null }
  public render() {
    return (
      <div>
        <h1>Welcome to my photos</h1>
        {this.state.photos != null && (
          <div>
            <h2>I have {this.state.photos.length} photos in total</h2>
            <PhotoList photos={this.state.photos} initialNumberOfPhotos={100} />
          </div>
        )}
      </div>
    )
  }
  componentWillUnmount() {
    this.subscriptions.forEach(s => {
      s.unsubscribe()
    })
  }
  componentDidMount() {
    this.subscriptions.push(
      Async.GET<Photo[]>("https://jsonplaceholder.typicode.com/photos").subscribe(photos => {
        this.setState({ photos })
      })
    )
  }
}
```

Certainly there is nothing wrong with this type of division of logic to smaller components and some might even prefer it this way. With declarative approach the code is more condensed and the behavior of the component is more clear at a glance.

And actually in the above case the h1 header is still rendered twice versus the declarative approach where it is only rendered once.

### Optimization

Now someone would say that it's easy to optimize the traditional React approach by making the `Photo` component a `PureComponent` to avoid the full render of the list every time that the `numberOfPhotos` is changed. This same optimization can be achieved with declarative components by using the `Sync.PureVar` component. An additional prop `injection` is provided. `Sync.PureVar` will perfom a check whether this props or the value has changed and opts out of render if not.

```JSX
class App extends React.Component {
  public render() {
    return (
      <div>
        <h1>Welcome to my photos</h1>
        <Async.Const value={Async.GET<Photo[]>("https://jsonplaceholder.typicode.com/photos")}>
          {photos => (
            <div>
              <h2>I have {photos.length} photos in total</h2>
              <Sync.Var initialValue={10}>
                {(numberOfPhotos, setNumberOfPhotos) => (
                  <Fragment>
                    <div>
                      <button
                        onClick={() => {
                          setNumberOfPhotos(numberOfPhotos - 1)
                        }}
                      >
                        -
                      </button>
                      <button
                        onClick={() => {
                          setNumberOfPhotos(numberOfPhotos + 1)
                        }}
                      >
                        +
                      </button>
                    </div>
                    {photos.slice(0, numberOfPhotos).map(photo => (
                      <Sync.PureVar injections={{ photo }} key={photo.id} initialValue={100}>
                        {(width, setWidth, { photo }) => (
                          <img
                            onClick={() => {
                              setWidth(width + 10)
                            }}
                            width={width}
                            src={photo.url}
                          />
                        )}
                      </Sync.PureVar>
                    ))}
                  </Fragment>
                )}
              </Sync.Var>
            </div>
          )}
        </Async.Const>
      </div>
    )
  }
}
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
      <Async.Const value={Async.GET<Photo[]>("https://jsonplaceholder.typicode.com/photos")}>
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
      <Sync.Var initialValue={"edit" as "edit" | "done"}>
        {(tab, setTab) => (
          <Fragment>
            {tab === "edit" && (
              <Async.Var
                onChanged={() => {
                  setTimeout(() => {
                    setTab("done")
                  }, 2000)
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
                                  {({ Validation, Input, TextArea }, __, onChange) => (
                                    <Fragment>
                                      <Validation for="id">
                                        {invalid => (
                                          <div style={{ color: invalid ? "red" : undefined }}>
                                            <label>Id</label>
                                            <Input
                                              type="number"
                                              onChange={(e: any) => {
                                                onChange({ id: parseInt(e.target.value, 10) })
                                              }}
                                              min={2}
                                              max={50}
                                              name="id"
                                            />
                                          </div>
                                        )}
                                      </Validation>
                                      <Validation for="userId">
                                        {invalid => (
                                          <div style={{ color: invalid ? "red" : undefined }}>
                                            <label>userId</label>
                                            <Input
                                              type="number"
                                              onChange={(e: any) => {
                                                onChange({ userId: parseInt(e.target.value, 10) })
                                              }}
                                              min={0}
                                              name="userId"
                                            />
                                          </div>
                                        )}
                                      </Validation>
                                      <Validation for="title">
                                        {invalid => (
                                          <div style={{ color: invalid ? "red" : undefined }}>
                                            <label>Title</label>
                                            <Input notEmpty={true} minLength={minLength} maxLength={40} name="title" />
                                          </div>
                                        )}
                                      </Validation>
                                      <Validation for="body">
                                        {invalid => (
                                          <div style={{ color: invalid ? "red" : undefined }}>
                                            <label>Body</label>
                                            <TextArea notEmpty={true} rows={5} maxLength={400} name="body" />
                                          </div>
                                        )}
                                      </Validation>
                                      <table>
                                        <thead>
                                          <tr>
                                            <th>Field name</th>
                                            {_.keys(formRules).map(ruleName => (
                                              <th>{ruleName}</th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {_.map(post, (__, key) => (
                                            <tr key={key}>
                                              <Validation for={key as keyof Post}>
                                                {invalid => (
                                                  <Fragment>
                                                    <th>{key}</th>
                                                    {_.keys(formRules).map(ruleKey => {
                                                      return (
                                                        <th key={ruleKey}>
                                                          {invalid && invalid[ruleKey as keyof typeof formRules] ? (
                                                            <span style={{ color: "red" }}>
                                                              ✕{" "}
                                                              <sub>
                                                                {invalid[ruleKey as keyof typeof formRules]!.ruleValue}
                                                              </sub>
                                                            </span>
                                                          ) : (
                                                            <span style={{ color: "green" }}>✔</span>
                                                          )}
                                                        </th>
                                                      )
                                                    })}
                                                  </Fragment>
                                                )}
                                              </Validation>
                                              <th />
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
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
            )}
            {tab === "done" && <p>Edit success</p>}
          </Fragment>
        )}
      </Sync.Var>
    )
  }
}
```

## Acknowledgements

Library boilerplate starter: https://github.com/alexjoverm/typescript-library-starter

## Dependencies
