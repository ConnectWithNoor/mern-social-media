import axios from 'axios';

const uploadPic = async (media) => {
  try {
    const form = new FormData();
    form.append('file', media);
    form.append('upload_preset', 'social_media');
    form.append('cloud_name', 'zepcom-noor');

    const res = await axios.post(process.env.CLOUDINAARY_BASE_URL, form);
    return res.data.url;
  } catch (error) {
    console.error(error);
    return;
  }
};

export default uploadPic;
