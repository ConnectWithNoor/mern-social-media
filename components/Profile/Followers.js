import React, { useState, useEffect } from 'react';
import { Button, Image, List } from 'semantic-ui-react';
import axios from 'axios';
import cookie from 'js-cookie';

import Spinner from '../Layout/Spinner';
import baseUrl from '../../utils/baseUrl';
import { NoFollowData } from '../Layout/NoData';
import { followUser, unfollowUser } from '../../utils/profileActions';

function Followers({
  user,
  loggedUserFollowStats,
  setUserFollowStats,
  profileUserId,
}) {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const getFollowers = async () => {
      setLoading(true);

      try {
        const resp = await axios.get(
          `${baseUrl}/api/profile/followers/${profileUserId}`,
          {
            headers: {
              Authorization: cookie.get('token'),
            },
          }
        );
        setFollowers(resp.data);
      } catch (error) {
        alert('Error Loading Followers');
      } finally {
        setLoading(false);
      }
    };

    getFollowers();
  }, [user]);

  return (
    <>
      {loading ? (
        <Spinner />
      ) : followers.length > 0 ? (
        followers.map((profileFollower) => {
          const isFollowing =
            loggedUserFollowStats.following.filter(
              (following) => following.user === profileFollower.user._id
            ).length > 0;

          return (
            <>
              <List
                key={profileFollower.user._id}
                divided
                verticalAlign='middle'
              >
                <List.Item>
                  <List.Content floated='right'>
                    {profileFollower.user._id !== user._id && (
                      <Button
                        color={isFollowing ? 'instagram' : 'twitter'}
                        content={isFollowing ? 'Following' : 'Follow'}
                        icon={isFollowing ? 'check' : 'add user'}
                        disabled={followLoading}
                        onClick={async () => {
                          setFollowLoading(true);
                          isFollowing
                            ? await unfollowUser(
                                profileFollower.user._id,
                                setUserFollowStats
                              )
                            : await followUser(
                                profileFollower.user._id,
                                setUserFollowStats
                              );
                          setFollowLoading(false);
                        }}
                      />
                    )}
                  </List.Content>
                  <Image avatar src={profileFollower.user.profilePicUrl} />
                  <List.Content
                    as='a'
                    href={`/${profileFollower.user.username}`}
                  >
                    {profileFollower.user.name}
                  </List.Content>
                </List.Item>
              </List>
            </>
          );
        })
      ) : (
        <NoFollowData followersComponent={true} />
      )}
    </>
  );
}

export default Followers;
