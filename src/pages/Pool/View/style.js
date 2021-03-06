import { Drawer, Modal } from 'antd'
import styled from 'styled-components'

export const StyledCardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;

  margin-bottom: 100px; // Fixed Footer 여백
`

export const StyledCardWrapper = styled.div`
  flex: 0 0 280px;
  margin-bottom: 30px;
`

export const StyledFooter = styled.footer`
  position: fixed;
  bottom: 0;
  width: 960px;
  max-width: calc(100% - 40px);
  margin-left: auto;
  margin-right: auto;
  color: white;
  background-color: #0c3b61;
  padding: 15px;
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  box-shadow: 0px -5px 10px -3px rgba(0, 0, 0, 0.4);

  display: flex;
  align-items: center;
`

export const ClickableImg = styled.img`
  cursor: pointer;
  width: 50px;
  height: 50px;

  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px) scale(1.03);
  }
`

export const StyledDrawer = styled(Drawer)`
  && {
    color: white;
    & .ant-drawer-content {
      overflow: inherit;
      background-color: #063a64;
    }
  }
`

export const StyledDrawerButton = styled.div`
  cursor: pointer;
  position: absolute;
  right: 400px;
  top: calc(50% - 50px);
  background-color: #063a64;
  width: 50px;
  height: 100px;

  border-top-left-radius: 25px;
  border-bottom-left-radius: 25px;

  display: flex;
  align-items: center;
  justify-content: center;
`

export const StyledContent = styled.div`
  background: linear-gradient(-45deg, #00293d, #061338, #00293d, #061338, #00293d);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;

  @keyframes gradient {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`

export const StyledBackgroundImageWrapper = styled.div`
  &:before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    background: url(/images/login/back.png);
    background-size: cover;
    background-position: center;
    opacity: 0.05;
  }
`

export const StyledModal = styled(Modal)`
  .ant-modal-content {
    background: #032642;
    box-shadow: 0px 25px 25px rgba(0, 0, 0, 0.5);
    .ant-modal-body {
    }

    .ant-modal-footer {
      display: none;
    }
  }
`
