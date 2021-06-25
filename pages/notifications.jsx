import React, { useEffect, useState } from 'react';
import { Feed, Segment, Divider, Container } from 'semantic-ui-react';
import axios from 'axios';
import { parseCookies } from 'nookies';
import cookie from 'js-cookie';

import baseUrl from '../utils/baseUrl';
import { NoNotifications } from '../components/Layout/NoData';
import LikeNotification from '../components/Notifications/LikeNotification';
import FollowerNotification from '../components/Notifications/FollowerNotification';
import CommentNotification from '../components/Notifications/CommentNotification';

function Notifications({ notifications, errorloading, user, userFollowStats }) {
  const [loggedUserFollowStats, setUserFollowStats] = useState(userFollowStats);

  useEffect(() => {
    const notificationRead = async () => {
      try {
        await axios.post(
          `${baseUrl}/api/notifications`,
          {},
          {
            headers: {
              Authorization: cookie.get('token'),
            },
          }
        );
      } catch (error) {
        console.error(error);
      }
    };
    return () => notificationRead();
  }, []);

  return (
    <>
      <Container style={{ marginTop: '1.5rem' }}>
        {notifications.length > 0 ? (
          <Segment color='teal' raised>
            <div
              style={{
                maxHeight: '40rem',
                overflow: 'auto',
                height: '40rem',
                position: 'relative',
                width: '100%',
              }}
            >
              <Feed size='small'>
                {notifications.map((notification) => (
                  <React.Fragment key={notification._id}>
                    {notification.type === 'newLike' &&
                      notification.post !== null && (
                        <LikeNotification notification={notification} />
                      )}

                    {notification.type === 'newComment' &&
                      notification.post !== null && (
                        <CommentNotification notification={notification} />
                      )}

                    {notification.type === 'newFollower' && (
                      <FollowerNotification
                        notification={notification}
                        loggedUserFollowStats={loggedUserFollowStats}
                        setUserFollowStats={setUserFollowStats}
                      />
                    )}
                  </React.Fragment>
                ))}
              </Feed>
            </div>
          </Segment>
        ) : (
          <NoNotifications />
        )}
        <Divider hidden />
      </Container>
    </>
  );
}

Notifications.getInitialProps = async (ctx) => {
  try {
    const { token } = parseCookies(ctx);
    const resp = await axios.get(`${baseUrl}/api/notifications`, {
      headers: {
        Authorization: token,
      },
    });

    return { notifications: resp.data.notifications };
  } catch (error) {
    return { errorloading: true };
  }
};

export default Notifications;
