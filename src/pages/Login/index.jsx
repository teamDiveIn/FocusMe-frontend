import * as B from 'src/components'
import { Form, Input, Button } from 'antd'
import theme from 'src/styles/theme'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'

const LoginPage = () => {
  return (
    <B.BaseTemplate verticalCenter>
      <B.Box display="flex" width="100%" style={{ justifyContent: 'space-evenly' }}>
        <B.Box mr={2}>
          <B.BaseCard backgroundColor={theme.primaryDark} shadow radius="5px">
            <B.BaseForm>
              <B.Box p={2}>
                <B.BaseText type="white" size={28} block mb={4}>
                  <B.TextCenter>환영합니다!</B.TextCenter>
                </B.BaseText>

                <Form.Item name="id">
                  <Input
                    prefix={
                      <B.BaseText pr={1}>
                        <UserOutlined />
                      </B.BaseText>
                    }
                    placeholder="아이디"
                  />
                </Form.Item>

                <Form.Item name="password">
                  <Input.Password
                    prefix={
                      <B.BaseText pr={1}>
                        <LockOutlined />
                      </B.BaseText>
                    }
                    placeholder="비밀번호"
                  />
                </Form.Item>

                <B.Box mtb={4}>
                  <Button type="primary" htmlType="submit" block>
                    로그인
                  </Button>
                </B.Box>

                <B.Box mt={4}>
                  <B.TextCenter>
                    <Link to="/register">
                      <B.BaseText>혹시 DiveIn이 처음이신가요?</B.BaseText>
                    </Link>
                  </B.TextCenter>
                </B.Box>
              </B.Box>
            </B.BaseForm>
          </B.BaseCard>
        </B.Box>
        <B.Box ml={2} display="flex" style={{ flexDirection: 'column' }} justify="center">
          <img src="/images/login/logo.png" alt="logo" width="300px" />
          <B.BaseText type="white" block size={16} mt={2} pl={2}>
            집중하기 어려울 땐 뭐다?
          </B.BaseText>
        </B.Box>
      </B.Box>
    </B.BaseTemplate>
  )
}

export default LoginPage
