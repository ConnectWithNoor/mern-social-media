import React, { useState, useEffect } from 'react';
import axios from 'axios';
import cookie from 'js-cookie';
import router from 'next/router';
import { List, Image, Search } from 'semantic-ui-react';

import baseUrl from '../../utils/baseUrl';

let cancel;

function SearchComponent() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (text.length <= 0 && loading) setLoading(false);
  }, [text]);

  const handlechange = async (e) => {
    const { value } = e.target;

    if (value.trim().length <= 0) return setText(value);

    setText(value);
    setLoading(true);

    try {
      cancel && cancel();

      const CancelToken = axios.CancelToken;
      const token = cookie.get('token');

      const resp = await axios.get(`${baseUrl}/api/search/${value}`, {
        headers: {
          Authorization: token,
        },
        cancelToken: new CancelToken((canceler) => {
          cancel = canceler;
        }),
      });

      if (resp.data.length <= 0) {
        if (results.length > 0) setResults([]);

        return setLoading(false);
      }

      return setResults(resp.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Search
      onBlur={() => {
        results.length > 0 && setResults([]);
        loading && setLoading(false);
        setText('');
      }}
      loading={loading}
      value={text}
      resultRenderer={ResultRenderer}
      results={results}
      onSearchChange={handlechange}
      minCharacters={1}
      onResultSelect={(e, data) => router.push(`/${data.result.username}`)}
    />
  );
}

const ResultRenderer = ({ _id, profilePicUrl, name }) => {
  return (
    <List key={_id}>
      <List.Item>
        <Image src={profilePicUrl} alt='profilePic' avatar />
        <List.Content header={name} as='a' />
      </List.Item>
    </List>
  );
};

export default SearchComponent;
