import React from 'react'

export interface ProgressContainerProps
  extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  progressing: boolean
  opaque?: boolean
}
export class ProgressContainer extends React.Component<ProgressContainerProps> {
  render() {
    return (
      <div
        style={{
          ...this.props.style,
          opacity: this.props.progressing && !this.props.opaque ? 0.5 : 1,
          pointerEvents: this.props.progressing ? 'none' : 'inherit'
        }}
      >
        {this.props.children}
      </div>
    )
  }
}
