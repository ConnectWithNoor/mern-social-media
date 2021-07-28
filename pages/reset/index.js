import React, { useState, useEffect } from 'react';
import { Form, Button, Message, Segment } from 'semantic-ui-react';
import axios from 'axios';

import baseUrl from '../../utils/baseUrl';
import catchErrors from '../../utils/catchErrors';

function ResetPage() {
  const [email, setEmail] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [emailChecked, setEmailChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    errorMsg !== null && setTimeout(() => setErrorMsg(null), 5000);
  }, [errorMsg]);

  const resetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${baseUrl}/api/reset`, { email });

      setEmailChecked(true);
    } catch (error) {
      setErrorMsg(catchErrors(error));
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      {emailChecked ? (
        <Message
          attached
          icon='mail'
          header='Check Your Inbox'
          content='Please check your inbox for further instructions'
        />
      ) : (
        <Message
          attached
          icon='settings'
          header='Reset Password'
          color='teal'
        />
      )}

      <Form
        loading={loading}
        onSubmit={resetPassword}
        error={errorMsg !== null}
      >
        <Message error header='Oops!' content={errorMsg} />

        <Segment>
          <Form.Input
            fluid
            icon='mail outline'
            type='email'
            iconPosition='left'
            label='Email'
            placeholder='Enter Email Address'
            name='email'
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />

          <Button
            disabled={loading || email?.length === 0}
            icon='configure'
            type='submit'
            color='orange'
            content='submit'
          />
        </Segment>
      </Form>
    </>
  );
}

export default ResetPage;
