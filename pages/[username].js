import React, { useState, useEffect } from 'react';
import { Grid } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { parseCookies } from 'nookies';
import cookie from 'js-cookie';

import baseUrl from '../utils/baseUrl';
import { NoProfile } from '../components/Layout/NoData';
import ProfileMenuTabs from '../components/Profile/ProfileMenuTabs';
import ProfileHeader from '../components/Profile/ProfileHeader';
import CardPost from '../components/Post/CardPost';
import { PlaceHolderPosts } from '../components/Layout/PlaceHolderGroup';
import { NoProfilePosts } from '../components/Layout/NoData';
import { PostDeleteToastr } from '../components/Layout/Toastr';
import Followers from '../components/Profile/Followers';
import Following from '../components/Profile/Following';

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
  const [showToaster, setShowToaster] = useState(false);
  const [activeItem, setActiveItem] = useState('profile');
  const [loggedUserFollowStats, setUserFollowStats] = useState(userFollowStats);

  const handleItemClick = (item) => setActiveItem(item);

  useEffect(() => {
    const getPosts = async () => {
      try {
        setLoading(true);

        const { username } = router.query;
        const token = cookie.get('token');

        const resp = await axios.get(
          `${baseUrl}/api/profile/post/${username}`,
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
  }, [router.query.username]);

  useEffect(() => {
    if (showToaster)
      setTimeout(() => {
        setShowToaster(false);
      }, 3000);
  }, [showToaster]);

  if (errorLoading) return <NoProfile />;

  return (
    <>
      {showToaster && <PostDeleteToastr />}
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

        <Grid.Row>
          <Grid.Column>
            {activeItem === 'profile' && (
              <>
                <ProfileHeader
                  profile={profile}
                  ownAccount={ownAccount}
                  loggedUserFollowStats={loggedUserFollowStats}
                  setUserFollowStats={setUserFollowStats}
                />

                {loading ? (
                  <PlaceHolderPosts />
                ) : posts.length > 0 ? (
                  posts.map((post) => (
                    <CardPost
                      key={post._id}
                      post={post}
                      user={user}
                      setPosts={setPosts}
                      setShowToaster={setShowToaster}
                    />
                  ))
                ) : (
                  <NoProfilePosts />
                )}
              </>
            )}

            {activeItem === 'followers' && (
              <Followers
                user={user}
                loggedUserFollowStats={loggedUserFollowStats}
                setUserFollowStats={setUserFollowStats}
                profileUserId={profile.user._id}
              />
            )}

            {activeItem === 'following' && (
              <Following
                user={user}
                loggedUserFollowStats={loggedUserFollowStats}
                setUserFollowStats={setUserFollowStats}
                profileUserId={profile.user._id}
              />
            )}
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
