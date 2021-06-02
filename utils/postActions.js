import axios from 'axios';
import cookie from 'js-cookie';

import baseUrl from './baseUrl';
import catchError from './catchErrors';

const Axios = axios.create({
  baseURL: `${baseUrl}/api/post`,
  headers: { Authorization: cookie.get('token') },
});

export const submitNewPost = async (
  user,
  text,
  location,
  picUrl,
  setPosts,
  setNewPost,
  setError
) => {
  try {
    const resp = await Axios.post('/', {
      text,
      location,
      picUrl,
    });

    const newPost = {
      _id: resp.data,
      user,
      text,
      location,
      picUrl,
      likes: [],
      comments: [],
    };

    setPosts((prev) => [newPost, ...prev]);

    setNewPost({ text: '', location: '' });
  } catch (error) {
    const errorMsg = catchError(error);
    setError(errorMsg);
  }
};

export const deletePost = async (postId, setPosts, setShowToaster) => {
  try {
    await Axios.delete(`/${postId}`);

    setPosts((prev) => prev.filter((post) => post._id !== postId));
    setShowToaster(true);
  } catch (error) {
    alert(catchError(error));
  }
};

// Used to like and unlike a post ( based on the like = true )

export const likePost = async (postId, userId, setLikes, like = true) => {
  try {
    if (like) {
      await Axios.put(`/like/${postId}`);
      setLikes((prev) => [...prev, { user: userId }]);
    } else {
      await Axios.put(`/unlike/${postId}`);
      setLikes((prev) => prev.filter((like) => like.user !== userId));
    }
  } catch (error) {
    alert(catchError(error));
  }
};
