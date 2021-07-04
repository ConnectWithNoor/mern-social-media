import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { parseCookies } from 'nookies';
import cookies from 'js-cookie';
import io from 'socket.io-client';
import { Segment } from 'semantic-ui-react';
import InfiniteScroll from 'react-infinite-scroll-component';

import baseUrl from '../utils/baseUrl';
import getUserInfo from '../utils/getUserInfo';
import newMsgSound from '../utils/newMsgSound';

import { NoPosts } from '../components/Layout/NoData';
import CreatePost from '../components/Post/CreatePost';
import CardPost from '../components/Post/CardPost';
import { PostDeleteToastr } from '../components/Layout/Toastr';
import MessageNotificationModel from '../components/Home/MessageNotificationModel';
import {
  PlaceHolderPosts,
  EndMessage,
} from '../components/Layout/PlaceHolderGroup';

function Index({ user, postsData, errorLoading, userFollowStats }) {
  const [posts, setPosts] = useState(postsData);
  const [showToaster, setShowToaster] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pageNumber, setPageNumber] = useState(2);
  const [newMessageReceieved, setNewMessageReceieved] = useState(null);
  const [newMessageModel, showNewMessageModel] = useState(false);

  const socket = useRef(null);

  useEffect(() => {
    document.title = `Welcome, ${user.name.split(' ')[0]}`;

    if (!socket.current) {
      socket.current = io(baseUrl);
    }

    if (socket.current) {
      socket.current.emit('join', { userId: user._id });

      socket.current.on('newMsgReceived', async ({ newMsg }) => {
        const { name, profilePicUrl } = await getUserInfo(newMsg.sender);
        if (user.newMessagePopup) {
          setNewMessageReceieved({
            ...newMsg,
            senderName: name,
            senderProfilePic: profilePicUrl,
          });
          showNewMessageModel(true);
        }

        newMsgSound(name);
      });
    }

    return () => {
      if (socket.current) {
        socket.current.emit('disconnect');
        socket.current.off();
      }
    };
  }, []);

  useEffect(() => {
    showToaster && setTimeout(() => setShowToaster(false), 3000);
  }, showToaster);

  const fetchDataonScroll = async () => {
    try {
      const resp = await axios.get(`${baseUrl}/api/post`, {
        headers: {
          Authorization: cookies.get('token'),
        },
        params: { pageNumber },
      });

      if (resp.data.post.length <= 0) return setHasMore(false);

      setPosts((prev) => [...prev, ...resp.data.post]);
      setPageNumber((prev) => prev + 1);
      return;
    } catch (error) {
      alert('Error fetching posts');
    }
  };

  return (
    <>
      {showToaster && <PostDeleteToastr />}
      {newMessageModel && newMessageReceieved && (
        <MessageNotificationModel
          socket={socket}
          showNewMessageModel={showNewMessageModel}
          newMessageModel={newMessageModel}
          newMessageReceieved={newMessageReceieved}
          user={user}
        />
      )}
      <Segment>
        <CreatePost user={user} setPosts={setPosts} />
        {posts.length <= 0 || errorLoading ? (
          <NoPosts />
        ) : (
          <InfiniteScroll
            hasMore={hasMore}
            next={fetchDataonScroll}
            loader={<PlaceHolderPosts />}
            endMessage={<EndMessage />}
            dataLength={posts.length}
          >
            {posts.map((post) => (
              <CardPost
                key={post._id}
                post={post}
                user={user}
                setPosts={setPosts}
                setShowToaster={setShowToaster}
              />
            ))}
          </InfiniteScroll>
        )}
      </Segment>
    </>
  );
}

Index.getInitialProps = async (ctx) => {
  try {
    const { token } = parseCookies(ctx);

    const resp = await axios.get(`${baseUrl}/api/post/`, {
      headers: {
        Authorization: token,
      },
      params: { pageNumber: 1 },
    });

    return { postsData: resp.data.post };
  } catch (error) {
    return { errorLoading: true };
  }
};

export default Index;
