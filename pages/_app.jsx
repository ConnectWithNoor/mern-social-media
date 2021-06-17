import axios from 'axios';
import { destroyCookie, parseCookies } from 'nookies';
import baseUrl from '../utils/baseUrl';
import { redirectUser } from '../utils/authUser';
import Layout from '../components/Layout/Layout';

import 'react-toastify/dist/ReactToastify.css';
import 'semantic-ui-css/semantic.min.css';

const protectedRoutesPath = [
  '/',
  '/[username]',
  // '/notification',
  '/post/[postId]',
  // '/message',
  // 'search',
];

function MyApp({ Component, pageProps }) {
  return (
    <Layout {...pageProps}>
      <Component {...pageProps} />
    </Layout>
  );
}

MyApp.getInitialProps = async ({ Component, ctx }) => {
  const { token } = parseCookies(ctx);

  let pageProps;

  const protectedRoutes = protectedRoutesPath.some(
    (ele) => ctx.pathname === ele
  );

  if (!token && protectedRoutes) {
    redirectUser(ctx, '/login');
  } else {
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }
  }

  try {
    const resp = await axios.get(`${baseUrl}/api/auth`, {
      headers: {
        Authorization: token,
      },
    });

    const { user, userFollowStats } = resp.data;
    if (user && !protectedRoutes) {
      redirectUser(ctx, '/');
    }

    pageProps = {
      ...pageProps,
      user,
      userFollowStats,
    };
  } catch (error) {
    console.error(error);
    destroyCookie(ctx, 'token');
  } finally {
    return { pageProps };
  }
};

export default MyApp;
