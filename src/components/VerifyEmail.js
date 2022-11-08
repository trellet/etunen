import React from 'react';
import { useState, useEffect } from 'react';
import { request } from './_api';
import { useLocation } from 'react-router-dom';

import Spinner from './Spinner';

function VerifyEmail() {
  const [state, setState] = useState('loading');
  let query = new URLSearchParams(useLocation().search);

  useEffect(() => {
    async function sendRequest() {
      const email = query.get('email');
      const token = query.get('verify');
      setState('loading');
      const result = await request('POST', 'user/verify', {
        email: email,
        token: token
      });

      if (result.status === 200) {
        const json = await result.json();
        if (json.verified)
          setState('success');
      } else {
        setState('error');
      }
    }
    sendRequest();
  }, []);

  if (state === 'success') return <p>Sähköpostiosoitteesi on nyt tarkistettu ja voit kirjautua sisään.</p>;
  if (state === 'error') return <p>Tapahtui virhe. Yritä uudelleen myöhemmin.</p>;
  return <Spinner />;
}

export default VerifyEmail;