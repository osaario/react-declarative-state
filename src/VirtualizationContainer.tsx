import * as React from 'react'

export interface VirtualizationContainerProps {
  children: (scrollTop: number, containerHeight: number) => JSX.Element
}

export class VirtualizationContainer extends React.Component<
  VirtualizationContainerProps,
  { scrollTop: number | null; containerHeight: number | null }
> {
  virtualizationRef = React.createRef<HTMLDivElement>()
  state = {
    scrollTop: null,
    containerHeight: null
  }

  render() {
    return (
      <div
        ref={this.virtualizationRef}
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
        {this.state.scrollTop != null &&
          this.state.containerHeight != null &&
          this.props.children(this.state.scrollTop!, this.state.containerHeight!)}
      </div>
    )
  }
  onResize = () => {
    const rect = this.virtualizationRef.current!.getBoundingClientRect()
    this.setState({
      containerHeight: rect.bottom - rect.top
    })
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize)
  }
  componentDidMount() {
    const rect = this.virtualizationRef.current!.getBoundingClientRect()
    this.setState({
      containerHeight: rect.bottom - rect.top,
      scrollTop: 0
    })
    window.addEventListener('resize', this.onResize)
  }
}
