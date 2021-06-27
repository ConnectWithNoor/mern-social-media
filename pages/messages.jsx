import React, { useState } from 'react';
import axios from 'axios';
import { parseCookies } from 'nookies';

import baseUrl from '../utils/baseUrl';

function Messages({ chatsData, errorLoading }) {
  const [chats, setChats] = useState(chatsData);
  return <div></div>;
}

Messages.getInitialProps = async (ctx) => {
  try {
    const { token } = parseCookies(ctx);
    const resp = await axios.get(`${baseUrl}/api/chats`, {
      headers: {
        Authorization: token,
      },
    });

    return { chatsData: resp.data.chats };
  } catch (error) {
    return { errorLoading: true };
  }
};

export default Messages;
