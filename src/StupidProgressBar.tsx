import React from 'react'

export default class ProgressBar extends React.PureComponent {
  render() {
    const props = {
      ...this.props,
      approxSec: undefined
    }
    return <div>This is supposed to be a progressbar..</div>
  }
}
