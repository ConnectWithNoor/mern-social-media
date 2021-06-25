import React, { useState } from 'react';
import {
  Card,
  Icon,
  Divider,
  Segment,
  Container,
  Image,
} from 'semantic-ui-react';
import Link from 'next/link';
import axios from 'axios';
import { parseCookies } from 'nookies';

import PostComments from '../../components/Post/PostComments';
import CommentInputField from '../../components/Post/CommentInputField';
import LikesList from '../../components/Post/LikesList';
import { NoPostFound } from '../../components/Layout/NoData';

import { likePost } from '../../utils/postActions';
import calculateTime from '../../utils/calculateTime';
import baseUrl from '../../utils/baseUrl';

function PostPage({ post, errorLoading, user }) {
  const [likes, setLikes] = useState(post.likes);
  const [comments, setComments] = useState(post.comments);
  const isLiked =
    likes.length > 0 &&
    likes.filter((like) => like.user === user._id).length > 0;

  if (errorLoading) return <NoPostFound />;

  return (
    <Container text>
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
                comments.map((comment) => (
                  <PostComments
                    key={comment._id}
                    comment={comment}
                    postId={post._id}
                    user={user}
                    setComments={setComments}
                  />
                ))}

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
    </Container>
  );
}

PostPage.getInitialProps = async (ctx) => {
  try {
    const { postId } = ctx.query;
    const { token } = parseCookies(ctx);

    const resp = await axios.get(`${baseUrl}/api/post/${postId}`, {
      headers: {
        Authorization: token,
      },
    });
    return { post: resp.data.post };
  } catch (error) {
    return { errorLoading: true };
  }
};

export default PostPage;
