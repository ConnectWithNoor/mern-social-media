import React, { useEffect } from 'react';
import axios from 'axios';

function Index({ user, userFollowStats }) {
  useEffect(() => {
    document.title = `Welcome, ${user.name.split(' ')[0]}`;
  }, []);
  return 'Homepage';
}

export default Index;
