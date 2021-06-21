import React, { useState, useEffect, useRef } from 'react';
import {
  Form,
  Button,
  Divider,
  List,
  Message,
  Checkbox,
} from 'semantic-ui-react';

import { passwordUpdate, toggleMessagePopup } from '../../utils/profileActions';

function Settings({ newMessagePopup }) {
  const [showUpdatePassword, setShowUpdatePassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showMessageSettings, setShowMessageSettings] = useState(false);
  const [popupSetting, setPopupSetting] = useState(newMessagePopup);
  const isFirstRun = useRef(true);

  useEffect(() => {
    success &&
      setTimeout(() => {
        setTimeout(false);
      }, 3000);
  }, [success]);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
  }, [popupSetting]);

  return (
    <>
      {success && (
        <>
          <Message icon='check circle' header='updated successfully' success />
          <Divider />
        </>
      )}

      <List size='huge' animated>
        <List.Item>
          <List.Icon name='user secret' size='large' verticalAlign='middle' />
          <List.Content>
            <List.Header
              as='a'
              onClick={() => setShowUpdatePassword(!showUpdatePassword)}
              content='Update Password'
            />
          </List.Content>
          {showUpdatePassword && (
            <UpdatePassword
              setSuccess={setSuccess}
              setShowUpdatePassword={setShowUpdatePassword}
            />
          )}
        </List.Item>

        <Divider />

        <List.Item>
          <List.Icon
            name='paper plane outline'
            size='large'
            verticalAlign='middle'
          />
          <List.Content>
            <List.Header
              onClick={() => setShowMessageSettings(!showMessageSettings)}
              as='a'
              content='Show new message popup'
            />
          </List.Content>
          {showMessageSettings && (
            <div style={{ marginTop: '10px' }}>
              Control whether a popup should appear when there is a new message?
              <br />
              <Checkbox
                checked={popupSetting}
                toggle
                onChange={() => {
                  toggleMessagePopup(popupSetting, setPopupSetting, setSuccess);
                }}
              />
            </div>
          )}
        </List.Item>
      </List>
    </>
  );
}

function UpdatePassword({ setSuccess, setShowUpdatePassword }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userPasswords, setUserPasswords] = useState({
    currentPassword: '',
    newPassword: '',
  });

  const [showTypedPassword, setShowTypedPassword] = useState({
    field1: false,
    field2: false,
  });

  useEffect(() => {
    error && setTimeout(() => setError(null), 4000);
  }, [error]);

  const { currentPassword, newPassword } = userPasswords;
  const { field1, field2 } = showTypedPassword;

  const handleChange = (ev) => {
    const { name, value } = ev.target;

    setUserPasswords((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setLoading(true);
    await passwordUpdate(setSuccess, userPasswords);
    setLoading(false);

    setShowUpdatePassword(false);
  };
  return (
    <>
      <Form error={error} loading={loading} onSubmit={handleSubmit}>
        <List.List>
          <List.Item>
            <Form.Input
              fluid
              icon={{
                name: 'eye',
                circular: true,
                link: true,
                onClick: () =>
                  setShowTypedPassword((prev) => ({
                    ...prev,
                    field1: !field1,
                  })),
              }}
              type={field1 ? 'text' : 'password'}
              iconPosition='left'
              label='Current Password'
              placeholder='Enter current password'
              name='currentPassword'
              onChange={handleChange}
              value={currentPassword}
            />

            <Form.Input
              fluid
              icon={{
                name: 'eye',
                circular: true,
                link: true,
                onClick: () =>
                  setShowTypedPassword((prev) => ({
                    ...prev,
                    field2: !field2,
                  })),
              }}
              type={field2 ? 'text' : 'password'}
              iconPosition='left'
              label='New Password'
              placeholder='Enter New password'
              name='newPassword'
              onChange={handleChange}
              value={newPassword}
            />

            <Button
              disabled={
                loading ||
                newPassword.trim().length < 1 ||
                currentPassword.trim().length < 1
              }
              compact
              icon='compact'
              color='teal'
              type='submit'
              content='Confirm'
            />

            <Button
              disabled={loading}
              compact
              icon='cancel'
              type='submit'
              content='Cancel'
              onClick={() => setShowUpdatePassword(false)}
            />

            <Message error icon='meh' header='Oops!' content='errorMsg' />
          </List.Item>
        </List.List>
      </Form>
    </>
  );
}

export default Settings;
