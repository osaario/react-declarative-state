import * as React from 'react'
import * as _ from 'lodash'
import { Async } from './Async'

export class ErrorAlert extends React.Component<{
  asyncState: Async.State | Async.State[]
  lang: string
}> {
  render() {
    const dataState = _.isArray(this.props.asyncState)
      ? this.props.asyncState.filter(s => s.progress === Async.Progress.Error).length > 0
        ? this.props.asyncState.filter(s => s.progress === Async.Progress.Error)[0]
        : null
      : this.props.asyncState

    if (dataState != null && dataState.progress === Async.Progress.Error) {
      let title = 'Load error'
      let desc = 'Could not load, check connection'
      if (dataState.type === Async.Type.Create || dataState.type === Async.Type.Update) {
        title = 'Update error'
        desc = 'Could not update, check connection'
      } else if (dataState.type === Async.Type.Delete) {
        title = 'Remove error'
        desc = 'Could not remove, check connection'
      }
      return (
        <div style={{ borderColor: 'red' }}>
          <h3>{title}</h3>
          <div>
            <p>{desc}</p>
          </div>
        </div>
      )
    } else {
      return null
    }
  }
}
