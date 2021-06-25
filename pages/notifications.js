import React from 'react';
import axios from 'axios';
import { parseCookies } from 'nookies';

import baseUrl from '../utils/baseUrl';

function Notifications({ notifications, errorloading }) {
  console.log(notifications);
  return <div></div>;
}

Notifications.getInitialProps = async (ctx) => {
  try {
    const { token } = parseCookies(ctx);
    const resp = await axios.get(`${baseUrl}/api/notifications`, {
      headers: {
        Authorization: token,
      },
    });

    return { notifications: resp.data };
  } catch (error) {
    return { errorloading: true };
  }
};

export default Notifications;
