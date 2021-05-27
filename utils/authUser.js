import axios from 'axios';
import Router from 'next/router';
import cookie from 'js-cookie';

import baseUrl from './baseUrl';
import catchErrors from './catchErrors';

const setToken = ({ token }) => {
  cookie.set('token', token);
  return Router.push('/');
};

export const registerUser = async (
  user,
  profilePicUrl,
  setError,
  setLoading
) => {
  try {
    const resp = await axios.post(`${baseUrl}/api/signup`, {
      user,
      profilePicUrl,
    });

    return setToken(resp.data);
  } catch (error) {
    const errorMessage = catchErrors(error);
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

export const loginUser = async (user, setError, setLoading) => {
  setLoading(true);

  try {
    const resp = await axios.post(`${baseUrl}/api/auth`, {
      user,
    });

    setToken(resp.data);
  } catch (error) {
    const errorMessage = catchErrors(error);
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

export const redirectUser = (ctx, location) => {
  if (ctx.req) {
    ctx.res.writeHead(302, { Location: location });
    ctx.res.end();
  } else {
    Router.push(location);
  }
};

export const logoutUser = (email) => {
  cookie.set('userEmail', email);
  cookie.remove('token');

  Router.push('/login');
};
