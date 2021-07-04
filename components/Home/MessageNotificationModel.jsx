import React, { useState } from 'react';
import Link from 'next/link';
import { Form, Modal, Segment, List, Icon } from 'semantic-ui-react';
import calculateTime from '../../utils/calculateTime';

function MessageNotificationModel({
  socket,
  showNewMessageModel,
  user,
  newMessageModel,
  newMessageReceieved,
}) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const onModalClose = () => {
    showNewMessageModel(false);
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (socket.current) {
      socket.current.emit('sendMsgFromNotification', {
        userId: user._id,
        msgSendToUserId: newMessageReceieved.sender,
        msg: text,
      });

      socket.current.on('msgSentFromNotification', async () => {
        showNewMessageModel(false);
      });
    }
  };

  return (
    <>
      <Modal
        size='small'
        open={newMessageModel}
        onClose={onModalClose}
        closeIcon
        closeOnDimmerClick
      >
        <Modal.Header
          content={`New Message Received From ${newMessageReceieved.senderName}`}
        />
        <Modal.Content>
          <div className='bubbleWrapper'>
            <div className='inlineContainer'>
              <img
                className='inlineIcon'
                src={newMessageReceieved.senderProfilePic}
              />
            </div>
            <div className='otherBubble other'>{newMessageReceieved.msg}</div>
            <span className='other'>
              {calculateTime(newMessageReceieved.date)}
            </span>
          </div>

          <div stype={{ position: 'sticky', bottom: '8px' }}>
            <Segment secondary color='teal' attached='bottom'>
              <Form reply onSubmit={handleSubmit}>
                <Form.Input
                  size='large'
                  placeholder='Send New Message'
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  action={{
                    color: 'blue',
                    icon: 'telegram plane',
                    disabled: text === '',
                    loading: loading,
                  }}
                />
              </Form>
            </Segment>
          </div>

          <div style={{ marginTop: '5px' }}>
            <Link href={`/messages?message=${newMessageReceieved.sender}`}>
              <a>View All Messages</a>
            </Link>

            <br />

            <Instructions username={user.username} />
          </div>
        </Modal.Content>
      </Modal>
    </>
  );
}

const Instructions = ({ username }) => {
  return (
    <List>
      <List.Item>
        <Icon name='help' />
        <List.Content>
          <List.Header>
            If you do not like this popup to appear when you receive a new
            message
          </List.Header>
        </List.Content>
      </List.Item>

      <List.Item>
        <Icon name='hand point right' />
        <List.Content>
          You can disable it by going to
          <Link href={`/${username}`}>
            <a>Account</a>
          </Link>
          page and click on the setting's tab
        </List.Content>
      </List.Item>

      <List.Item>
        <Icon name='hand point right' />
        Disable the Show New Message Popup settings
      </List.Item>
    </List>
  );
};

export default MessageNotificationModel;
