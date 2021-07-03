import React, { useState, useEffect, useRef } from 'react';
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
import io from 'socket.io-client';

import baseUrl from '../utils/baseUrl';
import getUserInfo from '../utils/getUserInfo';
import newMsgSound from '../utils/newMsgSound';

import Chat from '../components/Chats/Chat';
import ChatListSearch from '../components/Chats/ChatListSearch';
import Banner from '../components/Messages/Banner';
import Message from '../components/Messages/Message';
import MessageInputField from '../components/Messages/MessageInputField';
import { NoMessages } from '../components/Layout/NoData';

function Messages({ chatsData, errorLoading, user }) {
  const [chats, setChats] = useState(chatsData || []);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [bannerData, setBannerData] = useState({ name: '', profilePicUrl: '' });
  const router = useRouter();
  const socket = useRef();

  // ref is to presist the state of query string throughout rerender
  const openChatId = useRef('');
  // connection
  useEffect(() => {
    if (!socket.current) {
      socket.current = io(baseUrl);
    }

    if (socket.current) {
      socket.current.emit('join', { userId: user._id });

      socket.current.on('connectedUsers', ({ users }) => {
        if (users.length > 0) setConnectedUsers(users);
      });
    }

    if (chats.length > 0 && !router.query.message) {
      router.push(`/messages?message=${chats[0].messagesWith}`, undefined, {
        shallow: true,
      });
    }

    return () => {
      if (socket.current) {
        socket.current.emit('disconnect');
        socket.current.off();
      }
    };
  }, []);

  // loading messages
  useEffect(() => {
    const loadMessages = async () => {
      socket.current.emit('loadMessages', {
        userId: user._id,
        messagesWith: router.query.message,
      });

      socket.current.on('messagesLoaded', ({ chat }) => {
        setMessages(chat.messages);
        setBannerData({
          name: chat.messagesWith.name,
          profilePicUrl: chat.messagesWith.profilePicUrl,
        });

        openChatId.current = chat.messagesWith._id;
      });

      socket.current.on('noChatFound', async () => {
        const { name, profilePicUrl } = await getUserInfo(router.query.message);

        setBannerData(name, profilePicUrl);
        setMessages([]);
        openChatId.current = router.query.message;
      });
    };

    if (socket.current && router.query.message) loadMessages();
  }, [router.query.message]);

  // performing messages exchanges
  useEffect(() => {
    if (socket.current) {
      socket.current.on('msgSent', async ({ newMsg }) => {
        if (newMsg.receiver === openChatId.current) {
          setMessages((prev) => [...prev, newMsg]);

          setChats((prev) => {
            const prevChat = prev.find(
              (chat) => chat.messagesWith === newMsg.receiver
            );
            prevChat.lastMessage = newMsg.msg;
            prevChat.date = newMsg.date;
            return [...prev];
          });
        }
      });

      socket.current.on('newMsgReceived', async ({ newMsg }) => {
        let senderName;
        if (newMsg.sender === openChatId.current) {
          setMessages((prev) => [...prev, newMsg]);
          setChats((prev) => {
            const prevChat = prev.find(
              (chat) => chat.messagesWith === newMsg.sender
            );
            prevChat.lastMessage = newMsg.msg;
            prevChat.date = newMsg.date;
            senderName = prevChat.name;

            return [...prev];
          });
        } else {
          const ifPrevMsged =
            chats.filter((chat) => chat.messagesWith === newMsg.sender).length >
            0;

          if (ifPrevMsged) {
            setChats((prev) => {
              const prevChat = prev.find(
                (chat) => chat.messagesWith === newMsg.sender
              );
              prevChat.lastMessage = newMsg.msg;
              prevChat.date = newMsg.date;
              senderName = prevChat.name;

              return [...prev];
            });
          } else {
            const { name, profilePicUrl } = await getUserInfo(newMsg.sender);
            senderName = name;

            const newChat = {
              messagesWith: newMsg.sender,
              name,
              profilePicUrl,
              lastMessage: newMsg.msg,
              date: newMsg.date,
            };
            setChats((prev) => [newChat, ...prev]);
          }
        }

        newMsgSound(senderName);
      });
    }
  }, []);

  const sendMsg = (msg) => {
    if (socket.current) {
      socket.current.emit('sendNewMsg', {
        userId: user._id,
        msgSendToUserId: openChatId.current,
        msg,
      });
    }
  };

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
          <ChatListSearch chats={chats} setChats={setChats} />
        </div>
        {chats.length > 0 ? (
          <>
            <Grid stackable>
              <Grid.Column width={4}>
                <Comment.Group size='big'>
                  <Segment
                    raised
                    style={{ overflow: 'auto', maxHeight: '32rem' }}
                  >
                    {chats.map((chat, index) => (
                      <Chat
                        key={index}
                        connectedUsers={connectedUsers}
                        chat={chat}
                        setChats={setChats}
                      />
                    ))}
                  </Segment>
                </Comment.Group>
              </Grid.Column>

              <Grid.Column width={12}>
                {router.query.message && (
                  <>
                    <div
                      style={{
                        overflow: 'auto',
                        overflowX: 'hidden',
                        maxHeight: '35rem',
                        height: '35rem',
                        backgroundColor: 'whitesmoke',
                      }}
                    >
                      <div style={{ position: 'sticky', top: '0' }}>
                        <Banner bannerData={bannerData} />
                      </div>
                      {messages.length > 0 && (
                        <>
                          {messages.map((message, index) => (
                            <Message
                              key={index}
                              user={user}
                              bannerProfilePic={bannerData.profilePicUrl}
                              message={message}
                              setMessages={setMessages}
                              messagesWith={openChatId.current}
                            />
                          ))}
                        </>
                      )}
                    </div>
                    <MessageInputField sendMsg={sendMsg} />
                  </>
                )}
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
