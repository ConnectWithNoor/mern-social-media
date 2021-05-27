import React from 'react';
import axios from 'axios';

function Index({ user, userFollowStats }) {
  console.log({ user, userFollowStats });
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
