# Declarative Components

Declarative Components for React.

## Installation

```
npm install declarative-components
```

## Why?

### Cohesive UI:s

Easily compose complex UI:s with declarative components. Instead of storing the state in the component the state is stored internally inside the declarative components. This way a change to variable is reflected only to children without the need to re-render the whole root component.

```JSX
import { Async, Sync } from "declarative-components"

const App = () => (
  <div>
    <h1>Welcome to my photos</h1>
    <Async.Const getter={() => Async.GET("https://jsonplaceholder.typicode.com/photos")}>
      {photos => (
        <div>
          <h2>I have {photos.length} photos in total</h2>
          <Sync.Var initialValue={10}>
            {(numberOfPhotos, setNumberOfPhotos) => (
              <Fragment>
                <div>
                  <button
                    onClick={() => {
                      setNumberOfPhotos(numberOfPhotos + 1)
                    }}
                  >
                    Show more
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
```

To accomplish this kind of behavior in the traditional React style we would have to create _stateful_ subcomponents for rendering the photo and also for rendering the list.

```JSX
import { Async } from "declarative-components"

class Photo extends React.Component {
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
class PhotoList extends React.Component {
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
  render() {
    return (
      <div>
        <button onClick={this.increaseNumberOfPhotos}>Show more</button>
        {this.props.photos.slice(0, this.state.numberOfPhotos).map(photo => (
          <Photo src={photo.url} key={photo.id} initialWidth={100} />
        ))}
      </div>
    )
  }
}

class App extends React.Component {
  state = { photos: null }
  render() {
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
  componentDidMount() {
    Async.GET("https://jsonplaceholder.typicode.com/photos").then(photos => {
      this.setState({ photos })
    })
  }
}
export default App
```

Certainly there is nothing wrong with this type of division of logic to smaller components and some might even prefer it this way. With declarative approach the code is more condensed and the behavior of the component is more clear at a glance.

And actually in the above case the `h1` header is still rendered twice versus the declarative approach where it is only rendered once.

### Optimizable

Now someone would say that it's easy to optimize the traditional React approach by making the `Photo` component a `PureComponent` to avoid the full render of the list every time that the `numberOfPhotos` is changed. This same optimization can be achieved with declarative components by guarding the child with the `PureScope` component. A prop `injections` is provided to the `PureScope`component. `PureScope` will perfom a shallow comparison on the injections prop (In the same way as props are compared in `PureComponent`) to decide whether it is necessary to render again or not. Injections are injected to the children function.

```JSX
import { Sync, Async, PureScope } from "declarative-components"

const photoChild = ({ photo }) => (
  <Sync.Var initialValue={100}>
    {(width, setWidth) => (
      <img
        alt=""
        onClick={() => {
          setWidth(width + 10)
        }}
        width={width}
        src={photo.url}
      />
    )}
  </Sync.Var>
)

const App = () => (
  <div>
    <h1>Welcome to my photos</h1>
    <Async.Const getter={() => Async.GET("https://jsonplaceholder.typicode.com/photos")}>
      {photos => (
        <div>
          <Sync.Var initialValue={10}>
            {(numberOfPhotos, setNumberOfPhotos) => (
              <Fragment>
                <div>
                  <button
                    onClick={() => {
                      setNumberOfPhotos(numberOfPhotos + 1)
                    }}
                  >
                    Show more
                  </button>
                </div>
                {photos.slice(0, numberOfPhotos).map(photo => (
                  <PureScope children={photoChild} injections={{ photo }} key={photo.id} />
                ))}
              </Fragment>
            )}
          </Sync.Var>
        </div>
      )}
    </Async.Const>
  </div>
)
```

It is a good idea to declare the function for the optimized context outside the class scope to avoid capturing variables from upper scopes. Otherwise it is easy to run into bugs since the children function is not re-called unless injections or value are changed .

### Drop-In Asynchronous

Asynchronous `Var` and `Const` components let you define getters and setters (`Var`) as Promises.

```JSX
import { Sync, Async, Form } from "declarative-components"

const App = () => (
  <Sync.Var initialValue={1}>
    {(todoId, setTodoId) => (
      <Fragment>
        <h1>
          Edit todo {todoId}{" "}
          <button
            onClick={() => {
              setTodoId(todoId + 1)
            }}
          >
            Next
          </button>
        </h1>
        <Async.Var
          onValueSet={todo => {
            alert(`Todo ${todo.id} saved`)
          }}
          setter={value => Async.PUT("https://jsonplaceholder.typicode.com/todos/" + todoId, value)}
          getter={() => Async.GET("https://jsonplaceholder.typicode.com/todos/" + todoId)}
        >
          {(todo, progress, updateTodo, asyncType) => (
            <p
              style={{
                opacity: Async.isLoading(progress, asyncType) ? 0.5 : 1
              }}
            >
              <Form value={todo} onChange={updateTodo}>
                {({ Root }) => (
                  <Fragment>
                    <Root>
                      {({ Input, Validation }) => (
                        <Fragment>
                          <Input type="checkbox" name="completed" />
                          <Validation for="title">
                            {validation => (
                              <span style={{ color: validation ? "red" : undefined }}>
                                <label>Todo title</label>
                                <Input minLength={3} notEmpty={true} maxLength={100} name="title" />
                              </span>
                            )}
                          </Validation>
                        </Fragment>
                      )}
                    </Root>
                    <button type="submit" disabled={progress === Async.Progress.Progressing}>
                      Save Todo
                    </button>
                  </Fragment>
                )}
              </Form>
            </p>
          )}
        </Async.Var>
      </Fragment>
    )}
  </Sync.Var>
)
```

### Non-opinionated on visual representation

Although the components carry powerful abstractions they do not take any opinion on what the components look like. In this example the _virtualized_ `DataTable` can be made to look exactly like you want.

```JSX
import { DataTable, Sync, Async } from "declarative-components"

const tdStyle = { whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }
const App = () => (
  <Async.Const getter={() => Async.GET("https://jsonplaceholder.typicode.com/photos")}>
    {photos => (
      <DataTable data={photos} rowHeight={24} initialSortField={"title"}>
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
                <tr>
                  <Sort field="title">
                    {(sortDirection, toggleSort) => (
                      <th style={{ textAlign: "left", cursor: "pointer", whiteSpace: "nowrap" }} onClick={toggleSort}>
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
                    <td style={tdStyle}>{photo.title}</td>
                    <td>{photo.id}</td>
                    <td>{photo.albumId}</td>
                    <td>{photo.url}</td>
                  </Fragment>
                )}
              </TBody>
            </table>
          )
        }}
      </DataTable>
    )}
  </Async.Const>
)
```

### Flexible

Easily manage an array of forms with simple concise logic

```JSX
import { Sync, Async, Form, PureScope } from "declarative-components"

const postChild = ({ post, progress, setPost }) => (
  <Form value={post} onChange={setPost}>
    {({ Root }) => (
      <Fragment>
        <Root>
          {({ Input, TextArea, Validation }) => (
            <Fragment>
              <Validation for="title">
                {validation => (
                  <span style={{ color: validation ? "red" : undefined }}>
                    <label>Todo title</label>
                    <Input notEmpty={true} maxLength={100} name="title" />
                  </span>
                )}
              </Validation>
              <Validation for="body">
                {validation => (
                  <span style={{ color: validation ? "red" : undefined }}>
                    <label>Todo title</label>
                    <TextArea minLength={10} notEmpty={true} maxLength={10000} name="body" />
                  </span>
                )}
              </Validation>
            </Fragment>
          )}
        </Root>
        <button type="submit" disabled={progress === Async.Progress.Progressing}>
          Save Todo
        </button>
      </Fragment>
    )}
  </Form>
)
const App = () => (
  <Async.Array
    childKey="id"
    getter={() => Async.GET("https://jsonplaceholder.typicode.com/posts/").then(posts => posts.splice(0, 10))}
    itemSetter={post => Async.PUT("https://jsonplaceholder.typicode.com/todos/" + post.id, post)}
  >
    {(post, progress, setPost) => <PureScope children={postChild} injections={{ post, progress, setPost }} />}
  </Async.Array>
)
```

## Acknowledgements

Library boilerplate starter: https://github.com/alexjoverm/typescript-library-starter

## Dependencies
