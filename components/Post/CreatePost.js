import React, { useState, useRef } from 'react';
import { Form, Button, Image, Divider, Message, Icon } from 'semantic-ui-react';

import uploadPic from '../../utils/uploadPicToCloudinary';
import { submitNewPost } from '../../utils/postActions';

function CreatePost({ user, setPosts }) {
  const [newPost, setNewPost] = useState({ text: '', location: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [highlighted, setHighlighted] = useState(false);
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'media') {
      setMedia(files[0]);
      setMediaPreview(URL.createObjectURL(files[0]));
    }

    setNewPost((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let picUrl;

    if (media) picUrl = await uploadPic(media);
    if (!picUrl) {
      setLoading(false);
      return setError('Error uploading image');
    }

    await submitNewPost(
      user,
      newPost.text,
      newPost.location,
      picUrl,
      setPosts,
      setNewPost,
      setError
    );

    setMedia(null);
    setMediaPreview(null);
    setLoading(false);
  };

  return (
    <>
      <Form error={error} onSubmit={handleSubmit}>
        <Message
          error
          onDismiss={() => setError(null)}
          content={error}
          header='Oops.!'
        />

        <Form.Group>
          <Image src={user.profilePicUrl} circular avatar inline />
          <Form.TextArea
            placeholder='Whats happening'
            name='text'
            value={newPost.text}
            onChange={handleChange}
            rows='4'
            width='14'
          />
        </Form.Group>

        <Form.Group>
          <Form.Input
            value={newPost.location}
            name='location'
            onChange={handleChange}
            label='Add location'
            icon='map marker alternate'
            placeholder='Want to add location?'
          />

          <input
            ref={inputRef}
            onChange={handleChange}
            name='media'
            style={{ display: 'none' }}
            type='file'
            accept='image/'
          />
        </Form.Group>

        <div
          style={{
            textAlign: 'center',
            height: '150px',
            width: '150px',
            border: 'dotted',
            paddingTop: !media ? '60px' : '0px',
            cursor: 'pointer',
            borderColor: highlighted ? 'green' : 'black',
          }}
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setHighlighted(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setHighlighted(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setHighlighted(true);

            const droppedFile = Array.from(e.dataTransfer.files);
            setMedia(droppedFile[0]);
            setMediaPreview(URL.createObjectURL(droppedFile[0]));
          }}
        >
          {!media ? (
            <Icon name='plus' size='big' />
          ) : (
            <Image
              style={{ height: '150px', width: '150px' }}
              src={mediaPreview}
              alt='post image'
              centered
              size='medium'
            />
          )}
        </div>

        <Divider hidden />

        <Button
          circular
          disabled={newPost.text.trim().length <= 0 || loading}
          content={<strong>Post</strong>}
          style={{
            backgroundColor: '#1DA1F2',
            color: 'white',
          }}
          icon='send'
          loading={loading}
        />
      </Form>

      <Divider />
    </>
  );
}

export default CreatePost;