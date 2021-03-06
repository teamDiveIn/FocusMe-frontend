import React, { Component } from 'react'
import * as S from './style'

export class OpenViduVideo extends Component {
  constructor(props) {
    super(props)
    this.videoRef = React.createRef()
  }

  componentDidUpdate(props) {
    if (props && !!this.videoRef) {
      this.props.streamManager.addVideoElement(this.videoRef.current)
    }
  }

  componentDidMount() {
    if (this.props && !!this.videoRef) {
      this.props.streamManager.addVideoElement(this.videoRef.current)
    }
  }

  render() {
    return <S.StyledVideo autoPlay={true} ref={this.videoRef} onPlay={this.props.onPlay} />
  }
}
