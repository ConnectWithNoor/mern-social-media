import React, { useEffect } from 'react';
import axios from 'axios';

function Index({ user, userFollowStats }) {
  useEffect(() => {
    document.title = `Welcome, ${user.name.split(' ')[0]}`;
  }, []);
  return 'Homepage';
}

export default Index;

// Index.getInitialProps = async (ctx) => {
//   try {
//     const resp = await axios.get('https://jsonplaceholder.typicode.com/posts');

//     return { posts: resp.data };
//   } catch (error) {
//     return { setError: true };
//   }
// };
