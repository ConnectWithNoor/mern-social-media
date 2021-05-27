import React, { useState, useEffect, useRef } from 'react';
import {
  Form,
  Button,
  Message,
  Segment,
  TextArea,
  Divider,
} from 'semantic-ui-react';
import baseUrl from '../utils/baseUrl';
import axios from 'axios';
import {
  FooterMessage,
  HeaderMessage,
} from '../components/common/WelcomeMessage';
import CommonInputs from '../components/common/CommonInputs';
import ImageDropDiv from '../components/common/ImageDropDiv';
import { regexUserName } from '../utils/regex';
import { loginUser, registerUser } from '../utils/authUser';
import uploadPic from '../utils/uploadPicToCloudinary';
// varibales
let cancel;

function Signup() {
  const [user, setUser] = useState({
    name: '',
    email: '',
    password: '',
    bio: '',
    facebook: '',
    youtube: '',
    twitter: '',
    instagram: '',
  });

  const [showSocialLinks, setShowSocialLinks] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [username, setUsername] = useState('');
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  const [formLoading, setformLoading] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [highlighted, setHighlighted] = useState(false);
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(false);

  const inputRef = useRef(null);

  const handleSubmit = async (ev) => {
    ev.preventDefault();

    setformLoading(true);

    let profilePicUrl;

    if (media) {
      profilePicUrl = await uploadPic(media);
    }

    if (media && !profilePicUrl) {
      setformLoading(false);
      setErrorMessage('Error uploading Image');
    }

    await registerUser(user, profilePicUrl, setErrorMessage, setformLoading);
  };
  const handleChange = (ev) => {
    const { name, value, files } = ev.target;

    if (name === 'media') {
      setMedia(files[0]);
      setMediaPreview(URL.createObjectURL(files[0]));
    }

    setUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const checkUsername = async () => {
    setErrorMessage(null);
    try {
      if (cancel) cancel();
      const CancelToken = axios.CancelToken;

      setUsernameLoading(true);
      const resp = await axios.get(`${baseUrl}/api/signup/${username}`, {
        cancelToken: new CancelToken((canceler) => {
          cancel = canceler;
        }),
      });
      if (resp.data.includes('available')) {
        setUsernameAvailable(true);
        setUser((prev) => ({
          ...prev,
          username,
        }));
      }
    } catch (error) {
      console.error(error);
      setErrorMessage('Username Not Available');
      setUsernameAvailable(false);
    } finally {
      setUsernameLoading(false);
    }
  };

  const { name, email, password, bio } = user;

  useEffect(() => {
    const isUser = Object.values({
      usernameAvailable,
      name,
      email,
      password,
      bio,
    }).every((item) => Boolean(item));
    if (isUser) {
      setSubmitDisabled(false);
    } else {
      setSubmitDisabled(true);
    }
  }, [user, usernameAvailable]);

  useEffect(() => {
    if (username.length <= 0) setUsernameAvailable(false);
    else checkUsername();
  }, [username]);

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
          <ImageDropDiv
            mediaPreview={mediaPreview}
            setMediaPreview={setMediaPreview}
            setMedia={setMedia}
            inputRef={inputRef}
            highlighted={highlighted}
            setHighlighted={setHighlighted}
            handleChange={handleChange}
          />

          <Form.Input
            label='Name'
            placeholder='name'
            name='name'
            value={name}
            onChange={handleChange}
            fluid
            icon='user'
            iconPosition='left'
            required
          />

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

          <Form.Input
            loading={usernameLoading}
            error={!usernameAvailable}
            label='username'
            placeholder='username'
            name='username'
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);

              if (regexUserName.test(e.target.value)) {
                setUsernameAvailable(true);
              } else {
                setUsernameAvailable(false);
              }
            }}
            fluid
            icon={usernameAvailable ? 'check' : 'close'}
            iconPosition='left'
            type='text'
            required
          />

          <CommonInputs
            user={user}
            showSocialLinks={showSocialLinks}
            setShowSocialLinks={setShowSocialLinks}
            handleChange={handleChange}
          />

          <Divider hidden />
          <Button
            icon='signup'
            content='Signup'
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

export default Signup;
