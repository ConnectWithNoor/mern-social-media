import React, { useState, useEffect } from 'react';
import { Grid } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { parseCookies } from 'nookies';
import cookie from 'js-cookie';

import baseUrl from '../utils/baseUrl';
import { NoProfile } from '../components/Layout/NoData';
import ProfileMenuTabs from '../components/Profile/ProfileMenuTabs';

function ProfilePage({
  profile,
  followersLength,
  followingLength,
  errorLoading,
  user,
  userFollowStats,
}) {
  const ownAccount = profile.user._id === user._id;
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeItem, setActiveItem] = useState('profile');
  const [loggedUserFollowStats, setLoggedUserFollowStats] =
    useState(userFollowStats);

  const handleItemClick = (item) => setActiveItem(item);

  useEffect(() => {
    const getPosts = async () => {
      try {
        setLoading(true);

        const { username } = router.query;
        const token = cookie.get('token');

        const resp = await axios.get(
          `${baseUrl}/api/profile/posts/${username}`,
          {
            headers: {
              Authorization: token,
            },
          }
        );

        setPosts(resp.data);
      } catch (error) {
        alert('Error Loading Posts');
      } finally {
        setLoading(false);
      }
    };

    getPosts();
  }, []);

  if (errorLoading) return <NoProfile />;

  return (
    <>
      <Grid stackable>
        <Grid.Row>
          <Grid.Column>
            <ProfileMenuTabs
              activeItem={activeItem}
              handleItemClick={handleItemClick}
              followersLength={followersLength}
              followingLength={followingLength}
              ownAccount={ownAccount}
              loggedUserFollowStats={loggedUserFollowStats}
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </>
  );
}

ProfilePage.getInitialProps = async (ctx) => {
  try {
    const { username } = ctx.query;
    const { token } = parseCookies(ctx);

    const res = await axios.get(`${baseUrl}/api/profile/${username}`, {
      headers: {
        Authorization: token,
      },
    });

    const { profile, followersLength, followingLength } = res.data;

    return {
      profile,
      followersLength,
      followingLength,
    };
  } catch (error) {
    return { errorLoading: true };
  }
};

export default ProfilePage;
