import * as B from 'src/components'
import * as S from './style'
import { PoolCamCard } from './PoolCamCard'
import { useController } from './controller'
import React, { Component } from 'react'
import { useUserContext } from 'src/contexts/UserContext'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { fill } from 'lodash'
import { OpenVidu } from 'openvidu-browser'
import { nodeApiAxios } from 'src/lib/axios'
import axios from 'axios'

const withHooksHOC = (Component) => {
  return (props) => {
    const controller = useController()
    const { user } = useUserContext()

    return <Component user={user} controller={controller} {...props} />
  }
}

class PoolViewPage extends Component {
  constructor(props) {
    super(props)

    const { user, controller } = props
    const { sessionName } = controller

    this.state = {
      sessionName,
      nickname: user.nickname,
      session: undefined,
      mainStreamManager: undefined,
      publisher: undefined,
      subscribers: [],
      token: undefined,

      video: true,
      audio: true,
      listenMute: true,

      // ML
      webcam: undefined,
      model: undefined,
      maxPredictions: undefined,
      videoEl: undefined,
      loopTimeoutKey: undefined, // 루프 도는 타임아웃 콜백 키
      captureTimeoutKey: undefined,

      myThumbnail: undefined,
      thumbnails: {},
    }

    this.canvasRef = React.createRef()
    this.canvasCtx = null
    this.girl0Ref = React.createRef()
    this.girl1Ref = React.createRef()
    this.girl2Ref = React.createRef()
    this.girl3Ref = React.createRef()
    this.girl4Ref = React.createRef()

    this.boy0Ref = React.createRef()
    this.boy1Ref = React.createRef()
    this.boy2Ref = React.createRef()
    this.boy3Ref = React.createRef()
    this.boy4Ref = React.createRef()
  }

  async componentDidMount() {
    window.addEventListener('beforeunload', this.onbeforeunload)

    // canvas 확인
    this.canvasCtx = this.canvasRef.current.getContext('2d')

    this.joinSession()

    // ML 돌리기
    await this.mlInitialize()
    await this.mlLoop()
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.onbeforeunload)
    clearTimeout(this.state.loopTimeoutKey)
    clearTimeout(this.state.captureTimeoutKey)

    this.leaveSession()
    if (this.webcam) this.webcam.stop()
  }

  onbeforeunload = (event) => {
    this.leaveSession()
    if (this.webcam) this.webcam.stop()
  }

  deleteSubscriber = (streamManager) => {
    let subscribers = this.state.subscribers
    let index = subscribers.indexOf(streamManager, 0)
    if (index > -1) {
      subscribers.splice(index, 1)
      this.setState({
        subscribers: subscribers,
      })
    }
  }

  joinSession = async () => {
    this.OV = new OpenVidu()
    this.setState(
      {
        session: this.OV.initSession(),
      },
      async () => {
        var mySession = this.state.session

        mySession.on('streamCreated', (event) => {
          const subscriber = mySession.subscribe(event.stream, undefined)
          const subscribers = this.state.subscribers
          subscribers.push(subscriber)

          this.setState({
            subscribers: subscribers,
          })
        })

        mySession.on('streamDestroyed', (event) => {
          this.deleteSubscriber(event.stream.streamManager)
        })

        mySession.on('signal', (event) => {
          const data = JSON.parse(event.data)

          const { userId, url } = data

          const thumbnails = this.state.thumbnails

          thumbnails[userId.toString()] = url

          this.setState({
            thumbnails,
          })
        })

        const { data } = await nodeApiAxios.post('/webrtc/token', {
          session: this.state.sessionName,
        })

        const { token } = data

        await mySession.connect(token, { clientData: { nickname: this.props.user.nickname } })

        let publisher = this.OV.initPublisher(undefined, {
          audioSource: undefined, // The source of audio. If undefined default microphone
          videoSource: undefined, // The source of video. If undefined default webcam
          publishAudio: true, // Whether you want to start publishing with your audio unmuted or not
          publishVideo: true, // Whether you want to start publishing with your video enabled or not
          resolution: '280x270', // The resolution of your video
          frameRate: 30, // The frame rate of your video
          insertMode: 'APPEND', // How the video is inserted in the target element 'video-container'
          mirror: false, // Whether to mirror your local video or not
        })

        // publisher.on('streamPlaying', async (event) => {
        //   const video = event.target.videos[0].video
        //   this.videoEl = video
        // })

        mySession.publish(publisher)

        this.setState({
          mainStreamManager: publisher,
          publisher: publisher,
          token,
        })
      },
    )
  }

  leaveSession = async () => {
    const mySession = this.state.session

    if (mySession) {
      mySession.disconnect()
      await nodeApiAxios.delete('/webrtc/token', {
        data: { session: this.state.sessionName, token: this.state.token },
      })
    }

    this.OV = null
    this.setState({
      session: undefined,
      subscribers: [],
      mySessionId: 'SessionA',
      myUserName: 'Participant' + Math.floor(Math.random() * 100),
      mainStreamManager: undefined,
      publisher: undefined,
    })
  }

  toggleVideo = () => {
    if (this.state.publisher) {
      this.state.publisher.publishVideo(!this.state.video)
    }

    this.setState({
      video: !this.state.video,
    })
  }

  toggleAudio = () => {
    if (this.state.publisher) {
      this.state.publisher.publishAudio(!this.state.audio)
    }

    this.setState({
      audio: !this.state.audio,
    })
  }

  toggleListenMute = () => {
    this.state.subscribers.map((sub) => sub.subscribeToAudio(!this.state.listenMute))

    this.setState({
      listenMute: !this.state.listenMute,
    })
  }

  render() {
    return (
      <B.BaseTemplate>
        <div style={{ display: 'none' }}>
          <canvas ref={this.canvasRef} width="280" height="270"></canvas>
        </div>

        <div style={{ display: 'none' }}>
          <img ref={this.girl0Ref} src="/images/memoji/0.png" alt="memoji" />
          <img ref={this.girl1Ref} src="/images/memoji/1.png" alt="memoji" />
          <img ref={this.girl2Ref} src="/images/memoji/2.png" alt="memoji" />
          <img ref={this.girl3Ref} src="/images/memoji/3.png" alt="memoji" />
          <img ref={this.girl4Ref} src="/images/memoji/4.png" alt="memoji" />
        </div>

        <B.BaseText bold type="white" size={32} block mb={4}>
          영어 자격증 풀
        </B.BaseText>

        <S.StyledCardContainer>
          <S.StyledCardWrapper>
            <PoolCamCard
              streamManager={this.state.publisher}
              imageUrl={
                this.state.publisher
                  ? this.state.publisher.stream.videoActive
                    ? undefined
                    : this.state.myThumbnail
                  : undefined
              }
            />
          </S.StyledCardWrapper>

          {fill(Array(5), 0).map((_, index) => (
            <S.StyledCardWrapper key={index}>
              <PoolCamCard
                streamManager={
                  this.state.subscribers.length > index ? this.state.subscribers[index] : undefined
                }
                imageUrl={
                  this.state.subscribers.length > index
                    ? this.state.thumbnails[
                        JSON.parse(
                          this.state.subscribers[index].stream.connection.data.split('%/%')[1],
                        ).serverData.userId.toString()
                      ]
                    : undefined
                }
              />
            </S.StyledCardWrapper>
          ))}
        </S.StyledCardContainer>

        <S.StyledFooter>
          <B.Box
            style={{ width: 300, marginLeft: 'auto', marginRight: 'auto' }}
            display="flex"
            justify="space-between"
          >
            <S.ClickableImg
              src={`/images/pool/video-${this.state.video ? 'on' : 'off'}.png`}
              alt="control"
              onClick={this.toggleVideo}
            />
            <S.ClickableImg
              src={`/images/pool/mic-${this.state.audio ? 'on' : 'off'}.png`}
              alt="control"
              onClick={this.toggleAudio}
            />
            <S.ClickableImg
              src={`/images/pool/audio-${this.state.listenMute ? 'on' : 'off'}.png`}
              alt="control"
              onClick={this.toggleListenMute}
            />
          </B.Box>
        </S.StyledFooter>

        <S.StyledDrawer
          width="400"
          placement="right"
          closable={false}
          onClose={this.props.controller.onClose}
          visible={this.props.controller.visible}
        >
          <S.StyledDrawerButton onClick={() => this.props.controller.onToggleVisible()}>
            <B.BaseText size={24} style={{ lineHeight: 100 }}>
              {this.props.controller.visible ? <RightOutlined /> : <LeftOutlined />}
            </B.BaseText>
          </S.StyledDrawerButton>
          <B.Box mtb={4}>
            <B.TextCenter>
              <img src="/images/avatar.png" alt="avater" width={140} />
              <B.BaseText block mtb={2}>
                <img src="/images/achieve/2.png" alt="avater" width={32} />{' '}
                <B.BaseText pl={1} size="huge" bold>
                  {this.props.user.nickname}
                </B.BaseText>
              </B.BaseText>
            </B.TextCenter>
          </B.Box>
        </S.StyledDrawer>
      </B.BaseTemplate>
    )
  }

  mlInitialize = async () => {
    // Model URL
    const URL = 'https://teachablemachine.withgoogle.com/models/B9S7LxtSs/'

    const modelURL = URL + 'model.json'
    const metadataURL = URL + 'metadata.json'

    // eslint-disable-next-line
    this.model = await tmPose.load(modelURL, metadataURL)
    this.maxPredictions = this.model.getTotalClasses()

    // eslint-disable-next-line
    this.webcam = new tmPose.Webcam(280, 270, false) // webcam 생성
    await this.webcam.setup() // request access to the webcam
    await this.webcam.play()

    this.state.captureTimeoutKey = setTimeout(this.captureImage, 5000)
  }

  mlLoop = async (timestamp) => {
    this.webcam.update()
    await this.mlPredict() // 추론 수행
    this.state.loopTimeoutKey = setTimeout(this.mlLoop, 1000 / 60)
  }

  mlPredict = async () => {
    // Prediction #1: 입력 이미지에서 pose 추론
    // estimatePose can take in an image, video or canvas html element
    const { pose, posenetOutput } = await this.model.estimatePose(this.webcam.canvas)
    // Prediction 2: pose를 classification (어떤 포즈인지)
    const prediction = await this.model.predict(posenetOutput)

    this.mlDrawPose(pose, prediction)
  }

  mlDrawPose = (pose, prediction) => {
    const canvas = this.canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // 포즈가 없음 (사람이 화면에 나오지 않음)
    let center = 0
    if (pose) {
      // 얼굴의 중심 좌표
      center = pose.keypoints[0].position
      // 여기서 집중 안한 경우 처리하면 됨
    }

    if (canvas) {
      // 기본 화면 그리기
      ctx.fillStyle = 'black'
      ctx.fillRect(0, 0, 280, 270)

      // 이모지 그리기
      let argmax = 0
      let maxval = 0
      // 시선 방향 얻기 (argmax)
      for (let i = 0; i < this.maxPredictions; i++) {
        if (prediction[i].probability > maxval) {
          maxval = prediction[i].probability
          argmax = i
        }
      }

      if (center) {
        center = pose.keypoints[0].position
        // const minPartConfidence = 0.5
        // argmax에 따라 다른 이모지 출력하는 코드 여기 작성
        const image = this[`girl${argmax}Ref`].current
        ctx.drawImage(image, center.x - 70, center.y - 70, 140, 140)
      }

      // 포즈 그리기
      // if (pose) {
      //   const minPartConfidence = 0.5
      //   // eslint-disable-next-line
      //   tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx)
      //   // eslint-disable-next-line
      //   tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx)
      // }
    }
  }

  captureImage = async () => {
    const canvas = this.canvasRef.current

    if (canvas) {
      try {
        const imageDataUrl = canvas.toDataURL('image/png')

        const { data } = await nodeApiAxios.get('/common?ext=png')

        const { uploadUrl, url } = data

        var blobBin = atob(imageDataUrl.split(',')[1]) // base64 데이터 디코딩
        var array = []
        for (var i = 0; i < blobBin.length; i++) {
          array.push(blobBin.charCodeAt(i))
        }
        var file = new Blob([new Uint8Array(array)], { type: 'image/png' })

        await axios.put(uploadUrl, file)

        this.setState({ myThumbnail: url })

        await this.state.session.signal({
          data: JSON.stringify({ userId: this.props.user.id, url }),
          to: [],
          type: 'thumbnail',
        })
      } catch (e) {
        console.error(e)
      }
    }

    this.state.captureTimeoutKey = setTimeout(this.captureImage, 5000)
  }
}

export default withHooksHOC(PoolViewPage)
