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
import { Variable, Constant, Async } from "declarative-components"

const App = () => (
  <div>
    <h1>Welcome to my photos</h1>
    <Constant value={Async.GET("https://jsonplaceholder.typicode.com/photos")}>
      {photos => (
        <div>
          <h2>I have {photos.length} photos in total</h2>
          <Variable initialValue={10}>
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
                  <Variable key={photo.id} initialValue={100}>
                    {(width, setWidth) => (
                      <img
                        onClick={() => {
                          setWidth(width + 10)
                        }}
                        width={width}
                        src={photo.url}
                      />
                    )}
                  </Variable>
                ))}
              </Fragment>
            )}
          </Variable>
        </div>
      )}
    </Constant>
  </div>
)
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
import { Variable, Constant, Async } from "declarative-components"

class Photo extends React.PureComponent {
  render() {
    return (
      <Variable initialValue={100}>
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
      </Variable>
    )
  }
}

const App = () => (
  <div>
    <h1>Welcome to my photos</h1>
    <Constant value={Async.GET("https://jsonplaceholder.typicode.com/photos")}>
      {photos => (
        <div>
          <h2>I have {photos.length} photos in total</h2>
          <Variable initialValue={10}>
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
          </Variable>
        </div>
      )}
    </Constant>
  </div>
)
```


### Drop-In Asynchronous

Values can be of synchronous or asynchronous nature (`Promise`, `Observable` or concrete value), it makes no difference. You will get a progress and asyncType injected to children renderer from where you can see what the progress (`Progressing, Error, Idle`) state and type (`Create, Remove, Update, Load`) are.

```JSX
import { Variable, Form, Async } from "declarative-components"

const App = () => (
  <Variable initialValue={1}>
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
        <Variable
          onValueSet={todo => {
            alert(`Todo ${todo.id} saved`)
          }}
          key={todoId}
          initialValue={Async.GET("https://jsonplaceholder.typicode.com/todos/" + todoId)}
        >
          {(todo, updateTodo, progress, asyncType) => (
            <div
              style={{
                opacity: Async.isLoading(progress, asyncType) ? 0.5 : 1
              }}
            >
              <Form
                value={todo}
                onChange={todo => {
                  updateTodo(Async.PUT("https://jsonplaceholder.typicode.com/todos/" + todoId, todo))
                }}              >
                {({ Root }) => (
                  <Fragment>
                    <Root>
                      {({ Input, Validation }) => (
                        <Fragment>
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
            </div>
          )}
        </Variable>
      </Fragment>
    )}
  </Variable>
)
```

## Acknowledgements

Library boilerplate starter: https://github.com/alexjoverm/typescript-library-starter

## Dependencies
