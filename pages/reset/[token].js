import React, { useState, useEffect } from 'react';
import { Form, Button, Message, Segment, Divider } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import axios from 'axios';

import baseUrl from '../../utils/baseUrl';
import catchErrors from '../../utils/catchErrors';

function TokenPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState({ field1: '', field2: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    errorMsg !== null && setTimeout(() => setErrorMsg(null), 5000);
  }, [errorMsg]);

  const { field1, field2 } = newPassword;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setNewPassword((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setLoading(true);

    try {
      if (field1 !== field2) return setErrorMsg('Password doesnt match');

      await axios.post(`${baseUrl}/api/reset/token`, {
        password: field1,
        token: router.query.token,
      });

      setSuccess(true);
    } catch (error) {
      setErrorMsg(catchErrors(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {success ? (
        <Message
          attached
          success
          icon='check'
          size='large'
          header='Password reset successful'
          content='Please login again'
          onClick={() => router.push('/login')}
        />
      ) : (
        <Message
          attached
          icon='settings'
          header='Reset Password'
          color='teal'
        />
      )}

      {!success && (
        <Form
          loading={loading}
          onSubmit={resetPassword}
          error={errorMsg !== null}
        >
          <Message error header='Oops!' content={errorMsg} />

          <Segment>
            <Form.Input
              fluid
              icon='eye'
              type='password'
              iconPosition='left'
              label='New Password'
              placeholder='Enter New Password'
              name='field1'
              onChange={handleChange}
              value={field1}
              required
            />

            <Form.Input
              fluid
              icon='eye'
              type='password'
              iconPosition='left'
              label='Confirm Password'
              placeholder='Enter Confirm Password'
              name='field2'
              onChange={handleChange}
              value={field2}
              required
            />

            <Divider hidden />

            <Button
              disabled={field1 === '' || field2 === '' || loading}
              icon='configure'
              type='submit'
              color='orange'
              content='Reset'
            />
          </Segment>
        </Form>
      )}
    </>
  );
}

export default TokenPage;
