import React, { useState, useEffect } from 'react';
import {
  Card,
  Icon,
  Divider,
  Segment,
  Button,
  Popup,
  Header,
  Modal,
  Image,
} from 'semantic-ui-react';
import Link from 'next/link';

import PostComments from './PostComments';
import CommentInputField from './CommentInputField';
import LikesList from './LikesList';
import ImageModal from './ImageModal';
import NoImageModal from './NoImageModal';

import calculateTime from '../../utils/calculateTime';
import { deletePost, likePost } from '../../utils/postActions';

function CardPost({ post, user, setShowToaster, setPosts }) {
  const [likes, setLikes] = useState(post.likes);
  const [comments, setComments] = useState(post.comments);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const isLiked =
    likes.length > 0 &&
    likes.filter((like) => like.user === user._id).length > 0;

  const addPropsToModal = () => ({
    post,
    user,
    setLikes,
    setComments,
    likes,
    isLiked,
    comments,
  });

  return (
    <>
      {showModal && (
        <Modal
          onClose={() => setShowModal(false)}
          open={showModal}
          closeIcon
          closeOnDimmerClick
        >
          <Modal.Content>
            {post.picUrl ? (
              <ImageModal {...addPropsToModal()} />
            ) : (
              <NoImageModal {...addPropsToModal()} />
            )}
          </Modal.Content>
        </Modal>
      )}

      <Segment basic>
        <Card color='teal' fluid>
          {post.picUrl && (
            <Image
              src={post.picUrl}
              style={{ cursor: 'pointer' }}
              floated='left'
              wrapped
              ui={false}
              alt='PostImage'
              onClick={() => setShowModal(true)}
            />
          )}

          <Card.Content>
            <Image
              src={post.user.profilePicUrl}
              floated='left'
              avatar
              circular
            />

            {(user.role === 'root' || post.user._id === user._id) && (
              <>
                <Popup
                  on='click'
                  position='top right'
                  trigger={
                    <Image
                      src='/deleteIcon.svg'
                      style={{ cursor: 'pointer' }}
                      floated='right'
                      size='mini'
                    />
                  }
                >
                  <Header as='h4' content='Are you sure?' />
                  <p>The action is irrevesible!</p>
                  <Button
                    color='red'
                    icon='trash'
                    content='Delete'
                    onClick={() =>
                      deletePost(post._id, setPosts, setShowToaster)
                    }
                  />
                </Popup>
              </>
            )}

            <Card.Header>
              <Link href={`/${post.user.username}`}>
                <p>{post.user.name}</p>
              </Link>
            </Card.Header>

            <Card.Meta>{calculateTime(post.createdAt)}</Card.Meta>

            {post.location && <Card.Meta content={post.location} />}
            <Card.Description
              style={{
                fontSize: '17',
                letterSpacing: '0.1px',
                wordSpacing: '0.35px',
              }}
            >
              {post.text}
            </Card.Description>

            <Card.Content extra>
              <Icon
                name={isLiked ? 'heart' : 'heart outline'}
                color='red'
                style={{ cursor: 'pointer' }}
                onClick={() =>
                  likePost(post._id, user._id, setLikes, isLiked ? false : true)
                }
              />
              <LikesList
                postId={post._id}
                trigger={
                  likes.length > 0 && (
                    <span className='spanLikesList'>
                      {`${likes.length} ${
                        likes.length <= 1 ? 'like' : 'likes'
                      }`}
                    </span>
                  )
                }
              />

              <Icon
                name='comments outline'
                style={{ marginLeft: '7px' }}
                color='blue'
              />

              {comments.length > 0 &&
                comments.map(
                  (comment, index) =>
                    // to rander only upto 3 comments by default
                    index < 3 && (
                      <PostComments
                        key={comment._id}
                        comment={comment}
                        postId={post._id}
                        user={user}
                        setComments={setComments}
                      />
                    )
                )}

              {comments.length > 3 && (
                <Button
                  content='View More'
                  color='teal'
                  basic
                  circular
                  onClick={() => setShowModal(true)}
                />
              )}

              <Divider hidden />

              <CommentInputField
                user={user}
                postId={post._id}
                setComments={setComments}
              />
            </Card.Content>
          </Card.Content>
        </Card>
      </Segment>

      <Divider hidden />
    </>
  );
}

export default CardPost;
