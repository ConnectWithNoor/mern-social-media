import React, { useState, useRef } from 'react';
import { Form, Button, Divider, Message } from 'semantic-ui-react';

import ImageDropDiv from '../common/ImageDropDiv';
import CommonInputs from '../common/CommonInputs';

import { profileUpdate } from '../../utils/profileActions';
import uploadPic from '../../utils/uploadPicToCloudinary';

function UpdateProfile({ Profile }) {
  const [profile, setProfile] = useState({
    profilePicUrl: Profile.user.profilePicUrl,
    bio: Profile.bio,
    facebook: Profile.social.facebook,
    twitter: Profile.social.twitter,
    instagram: Profile.social.instagram,
    youtube: Profile.social.youtube,
  });
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSocialLinks, setShowSocialLinks] = useState(false);
  const [highlighted, setHighlighted] = useState(false);
  const inputRef = useRef(null);

  const handleChange = (ev) => {
    const { name, value, files } = ev.target;

    if (name === 'media') {
      setMedia(files[0]);
      setMediaPreview(URL.createObjectURL(files[0]));
    }

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let profilePicUrl;

    if (media) {
      profilePicUrl = await uploadPic(media);
    }

    if (media && !profilePicUrl) {
      setLoading(false);
      return setError('Error Uploading Image');
    }

    await profileUpdate(profile, setLoading, setError, profilePicUrl);
  };

  return (
    <>
      <Form loading={loading} error={error !== null} onSubmit={handleSubmit}>
        <Message
          error
          onDismiss={() => setError(null)}
          content={error}
          header='Oops!'
          attached
        />

        <ImageDropDiv
          inputRef={inputRef}
          highlighted={highlighted}
          setHighlighted={setHighlighted}
          handleChange={handleChange}
          mediaPreview={mediaPreview}
          setMediaPreview={setMediaPreview}
          setMedia={setMedia}
          profilePicUrl={profile.profilePicUrl}
        />

        <CommonInputs
          bio={profile.bio}
          facebook={profile.facebook}
          instagram={profile.instagram}
          youtube={profile.youtube}
          twitter={profile.twitter}
          handleChange={handleChange}
          showSocialLinks={showSocialLinks}
          setShowSocialLinks={setShowSocialLinks}
        />

        <Divider hidden />

        <Button
          color='blue'
          disabled={profile.bio === '' || loading}
          icon='pencil alternate'
          content='Submit'
          type='submit'
        />
      </Form>
    </>
  );
}

export default UpdateProfile;
