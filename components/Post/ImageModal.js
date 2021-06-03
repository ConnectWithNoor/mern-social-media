import React from 'react';
import { Modal, Grid, Image, Card, Icon, Divider } from 'semantic-ui-react';
import Link from 'next/link';

import PostComments from './PostComments';
import CommentInputField from './CommentInputField';
import LikesList from './LikesList';

import calculateTime from '../../utils/calculateTime';
import { likePost } from '../../utils/postActions';

function ImageModal({
  post,
  user,
  setLikes,
  setComments,
  likes,
  isLiked,
  comments,
}) {
  return (
    <Grid columns={2} stackable relaxed>
      <Grid.Column>
        <Modal.Content image>
          <Image wrapped size='large' src={post.picUrl} />
        </Modal.Content>
      </Grid.Column>

      <Grid.Column>
        <Card fluid>
          <Card.Content>
            <Image floated='left' avatar src={post.user.profilePicUrl} />

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

              <Divider hidden />

              <div
                style={{
                  overflow: 'auto',
                  height: '200px',
                  marginBottom: '8px',
                }}
              >
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
              </div>
              <CommentInputField
                postId={post._id}
                user={user}
                setComments={setComments}
              />
            </Card.Content>
          </Card.Content>
        </Card>
      </Grid.Column>
    </Grid>
  );
}

export default ImageModal;
