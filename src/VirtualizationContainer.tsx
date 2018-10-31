import * as React from 'react'

export interface VirtualizationContainerProps {
  children: (scrollTop: number, containerHeight: number) => JSX.Element
}

export class VirtualizationContainer extends React.Component<VirtualizationContainerProps, { scrollTop: number }> {
  state = {
    scrollTop: 0,
    height: window.innerHeight
  }
  virtualizedRef = React.createRef<HTMLDivElement>()

  render() {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          overflow: 'scroll',
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
        }}
        onScroll={e => {
          const elem = e.target as any
          this.setState({ scrollTop: elem.scrollTop })
        }}
      >
        {this.props.children(this.state.scrollTop, this.state.height)}
      </div>
    )
  }
}
