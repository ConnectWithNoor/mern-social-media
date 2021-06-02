import React, { useState, useEffect } from 'react';
import axios from 'axios';
import baseUrl from '../utils/baseUrl';
import { Segment } from 'semantic-ui-react';
import { parseCookies } from 'nookies';
import { NoPosts } from '../components/Layout/NoData';

import CreatePost from '../components/Post/CreatePost';
import CardPost from '../components/Post/CardPost';
import { PostDeleteToastr } from '../components/Layout/Toastr';

function Index({ user, postsData, errorLoading, userFollowStats }) {
  const [posts, setPosts] = useState(postsData);
  const [showToaster, setShowToaster] = useState(false);

  useEffect(() => {
    document.title = `Welcome, ${user.name.split(' ')[0]}`;
  }, []);

  useEffect(() => {
    showToaster && setTimeout(() => setShowToaster(false), 3000);
  }, showToaster);

  return posts.length <= 0 || errorLoading ? (
    <NoPosts />
  ) : (
    <>
      {showToaster && <PostDeleteToastr />}
      <Segment>
        <CreatePost user={user} setPosts={setPosts} />
        {posts.map((post) => (
          <CardPost
            key={post._id}
            post={post}
            user={user}
            setPosts={setPosts}
            setShowToaster={setShowToaster}
          />
        ))}
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
    });
    return { postsData: resp.data.post };
  } catch (error) {
    return { errorLoading: true };
  }
};

export default Index;
