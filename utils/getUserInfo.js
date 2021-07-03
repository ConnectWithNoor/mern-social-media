import axios from 'axios';
import cookie from 'js-cookie';

import baseUrl from '../utils/baseUrl';

const getUserInfo = async (userToFindId) => {
  try {
    const resp = await axios.get(`${baseUrl}/api/chats/user/${userToFindId}`, {
      headers: {
        Authorization: cookie.get('token'),
      },
    });

    return { name: resp.data.name, profilePicUrl: resp.data.profilePicUrl };
  } catch (error) {
    alert('Error looking for user');
  }
};

export default getUserInfo;
