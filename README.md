# Declarative Components

Declarative Components for React. Create asynchronous UI:s with ease.

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

Now someone would say that it's easy to optimize the traditional React approach by making the `Photo` component a `PureComponent` to avoid the full render of the list every time that the `numberOfPhotos` is changed. Same can be achieved with the *declarative* way without the need to create a *stateful* component.

```JSX
class Photo extends React.PureComponent {
  render() {
    return (
      <Sync.Var initialValue={100}>
        {(width, setWidth) => (
          <img
            alt=""
            onClick={() => {
              setWidth(width + 10)
            }}
            width={width}
            src={this.props.photo.url}
          />
        )}
      </Sync.Var>
    )
  }
}

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
                  <Photo photo={photo} />
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

### Composable and powerful

Compose a *virtualized* datatable easily by combining different declarative operators. `declarative-components` take no opinions on styling so you can make your table to look exactly like you want.

```JSX
import { Async, VirtualizationContainer, DataOperator } from "declarative-components"

const tdStyle = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", padding: 8 }
const thStyle = { textAlign: "left", cursor: "pointer", whiteSpace: "nowrap" }
const sortIndicator = sortDirection => (sortDirection === "desc" ? "⬇" : sortDirection === "asc" ? "⬆" : "⬍")
class CommentRow extends React.PureComponent {
  render() {
    const comment = this.props.comment
    return (
      <tr>
        <td style={tdStyle}>{comment.name}</td>
        <td>{comment.email}</td>
        <td style={tdStyle}>{comment.body}</td>
        <td>{comment.postId}</td>
      </tr>
    )
  }
}

const getter = () => Async.GET("https://jsonplaceholder.typicode.com/comments")
class App extends React.Component {
  render() {
    return (
      <Async.Const getter={getter}>
        {data => (
          <DataOperator initialSortField={"name"} data={data}>
            {(sortedData, { Sort }, searchString, onSearch) => (
              <VirtualizationContainer>
                {(scrollTop, containerHeight) => (
                  <div>
                    <h1>Comments</h1>
                    <h2>These are comments</h2>
                    <input
                      value={searchString}
                      placeholder={"Search comments"}
                      onChange={(e: any) => {
                        onSearch(e.target.value)
                      }}
                    />
                    <table style={{ tableLayout: "fixed", width: "100%", overflow: "hidden" }}>
                      <thead>
                        <tr>
                          <Sort field="name">
                            {(sortDirection, toggleSort) => (
                              <th style={thStyle} onClick={toggleSort}>
                                Name {sortIndicator(sortDirection)}
                              </th>
                            )}
                          </Sort>
                          <Sort field="email">
                            {(sortDirection, toggleSort) => (
                              <th style={thStyle} onClick={toggleSort}>
                                Email {sortIndicator(sortDirection)}
                              </th>
                            )}
                          </Sort>
                          <td>Body</td>
                          <td>Post id</td>
                        </tr>
                      </thead>
                      <Async.Array
                        virtualization={{
                          rowHeight: 34,
                          containerHeight,
                          wrapperComponentClass: "tbody",
                          scrollTop
                        }}
                        childKey="id"
                        getter={() => Promise.resolve(sortedData)}
                      >
                        {comment => <CommentRow key={comment.id} comment={comment} />}
                      </Async.Array>
                    </table>
                  </div>
                )}
              </VirtualizationContainer>
            )}
          </DataOperator>
        )}
      </Async.Const>
    )
  }
}
```

## Acknowledgements

Library boilerplate starter: https://github.com/alexjoverm/typescript-library-starter

## Dependencies
