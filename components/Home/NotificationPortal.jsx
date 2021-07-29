import React from 'react';
import { Segment, TransitionablePortal, Icon, Feed } from 'semantic-ui-react';
import { useRouter } from 'next/router';

import newMsgSound from '../../utils/newMsgSound';
import calculateTime from '../../utils/calculateTime';

function NotificationPortal({
  newNofitication,
  notificationPopup,
  setNofiticaionPopup,
}) {
  const router = useRouter();
  const { name, profilePicUrl, username, postId } = newNofitication;

  return (
    <TransitionablePortal
      transition={{ animation: 'fade left', duration: 500 }}
      onClose={() => notificationPopup && setNofiticaionPopup(false)}
      onOpen={newMsgSound}
      open={notificationPopup}
    >
      <Segment
        style={{ right: '5%', position: 'fixed', top: '10%', zIndex: 1000 }}
      >
        <Icon
          name='close'
          size='large'
          style={{ float: 'right', cursor: 'pointer' }}
          onClick={() => setNofiticaionPopup(false)}
        />

        <Feed>
          <Feed.Event>
            <Feed.Label>
              <img src={profilePicUrl} alt='img' />
            </Feed.Label>
            <Feed.Content>
              <Feed.Summary>
                <Feed.User onClick={() => router.push(`/${username}`)}>
                  {name}
                </Feed.User>{' '}
                liked your{' '}
                <a onClick={() => router.push(`/post/${postId}`)}>post</a>
                <Feed.Date>{calculateTime(Date.now())}</Feed.Date>
              </Feed.Summary>
            </Feed.Content>
          </Feed.Event>
        </Feed>
      </Segment>
    </TransitionablePortal>
  );
}

export default NotificationPortal;