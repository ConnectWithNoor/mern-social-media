import React, { useState, useEffect, useRef } from 'react';
import {
  Form,
  Button,
  Message,
  Segment,
  TextArea,
  Divider,
} from 'semantic-ui-react';
import axios from 'axios';
import {
  FooterMessage,
  HeaderMessage,
} from '../components/common/WelcomeMessage';
import baseurl from '../utils/baseUrl';
import { loginUser } from '../utils/authUser';

function Login() {
  const [user, setUser] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [formLoading, setformLoading] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(true);

  const { email, password } = user;

  useEffect(() => {
    const isUser = Object.values({
      email,
      password,
    }).every((item) => Boolean(item));
    if (isUser) {
      setSubmitDisabled(false);
    } else {
      setSubmitDisabled(true);
    }
  }, [user]);

  const handleChange = (ev) => {
    const { name, value } = ev.target;

    setUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await loginUser(user, setErrorMessage, setformLoading);
  };

  return (
    <>
      <HeaderMessage />

      <Form
        loading={formLoading}
        error={errorMessage !== null}
        onSubmit={handleSubmit}
      >
        <Message
          error
          header='Oops!'
          content={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />

        <Segment>
          <Form.Input
            label='Email'
            placeholder='email'
            name='email'
            value={email}
            onChange={handleChange}
            fluid
            icon='envelope'
            iconPosition='left'
            type='email'
            required
          />

          <Form.Input
            label='Password'
            placeholder='password'
            name='password'
            value={password}
            onChange={handleChange}
            fluid
            required
            icon={{
              name: 'eye',
              circular: true,
              link: true,
              onClick: () => setShowPassword(!showPassword),
            }}
            iconPosition='left'
            type={showPassword ? 'text' : 'password'}
          />

          <Divider hidden />
          <Button
            icon='sign-in'
            content='Login'
            type='submit'
            color='orange'
            disabled={submitDisabled}
          />
        </Segment>
      </Form>

      <FooterMessage />
    </>
  );
}

export default Login;
