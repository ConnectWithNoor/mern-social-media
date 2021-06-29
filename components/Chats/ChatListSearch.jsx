import React, { useState, useEffect } from 'react';
import axios from 'axios';
import cookie from 'js-cookie';
import { useRouter } from 'next/router';
import { List, Image, Search } from 'semantic-ui-react';

import baseUrl from '../../utils/baseUrl';

let cancel;

function ChatListSearch({ chats, setChats }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const router = useRouter();

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

  const addChat = (result) => {
    const alreadyInChat =
      chats.filter((chat) => chat.messagesWith === results._id).length > 0;

    if (alreadyInChat) {
      return router.push(`/messages?message=${result._id}`);
    } else {
      const newChat = {
        messagesWith: result._id,
        name: result.name,
        profilePicUrl: result.profilePicUrl,
        lastMessage: '',
        date: Date.now(),
      };
      setChats((prev) => [newChat, ...prev]);

      return router.push(`/messages?message=${result._id}`);
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
      onResultSelect={(e, data) => addChat(data.result)}
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

export default ChatListSearch;
