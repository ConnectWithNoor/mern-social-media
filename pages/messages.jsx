import React, { useState, useEffect } from 'react';
import {
  Segment,
  Header,
  Divider,
  Comment,
  Grid,
  Icon,
} from 'semantic-ui-react';
import axios from 'axios';
import { parseCookies } from 'nookies';
import { useRouter } from 'next/router';

import baseUrl from '../utils/baseUrl';
import Chat from '../components/Chats/Chat';
import ChatListSearch from '../components/Chats/ChatListSearch';
import { NoMessages } from '../components/Layout/NoData';

function Messages({ chatsData, errorLoading, user }) {
  const [chats, setChats] = useState(chatsData || []);
  const router = useRouter();

  useEffect(() => {
    if (chats.length > 0 && !router.query.message) {
      router.push(`/messages?message=${chats[0].messagesWith}`, undefined, {
        shallow: true,
      });
    }
  }, []);

  return (
    <>
      <Segment padded basic size='large' style={{ marginTop: '5px' }}>
        <Header
          icon='home'
          content='Go Back'
          onClick={() => router.push('/')}
          style={{ cursor: 'pointer' }}
        />

        <Divider hidden />

        <div style={{ marginBottom: '10px' }}>
          <ChatListSearch user={user} chats={chats} setChats={setChats} />
        </div>
        {chats.length > 0 ? (
          <>
            <Grid stackable>
              <Grid.Column width={5}>
                <Comment.Group size='big'>
                  <Segment
                    raised
                    style={{ overflow: 'auto', maxHeight: '32rem' }}
                  >
                    {chats.map((chat, index) => (
                      <Chat key={index} chat={chat} setChats={setChats} />
                    ))}
                  </Segment>
                </Comment.Group>
              </Grid.Column>
            </Grid>
          </>
        ) : (
          <NoMessages />
        )}
      </Segment>
    </>
  );
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
