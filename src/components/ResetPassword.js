import React from 'react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { request } from './_api';

import Alert from 'react-bootstrap/Alert';
import Form from 'react-bootstrap/Form';
import Spinner from './Spinner';
import Button from 'react-bootstrap/Button';


function ResetPassword(props) {
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [state, setState] = useState('form');
  const [error, setError] = useState(null);
  let query = new URLSearchParams(useLocation().search);

  async function sendRequest() {
    setState('sending');
    const body = {
      email: query.get('email'),
      resetToken: query.get('token'),
      password: password1
    };

    const result = await request('POST', 'user/resetPassword', body);
    if (result.status === 200) {
      setError(null);
      setState('success');
    } else if (result.status === 403) {
      setError('Unohtuneen salasanan linkki on vanhentunut.');
      setState('form');
    } else {
      setError('Lähettämisessä tapahtui virhe. Yritä uudelleen myöhemmin.');
      setState('form');
    }
  }

  if (state === 'sending') return <Spinner />;
  if (state === 'success') return <p>Salasanasi on vaihdettu onnistuneesti. Voit nyt kirjautua sisään.</p>;

  return (
    <Form className="signin d-grid gap-3" onSubmit={async (e) => {
      e.preventDefault();
      if (password1 !== password2) {
        setError('Salasanat eivät täsmää.');
        setState('form');
        return;
      }
      await sendRequest();
    }}>
      <div>
        <Form.Control value={query.get('email')} type="email" disabled />
        <Form.Control minlength="8" maxlength="100" required value={password1} onChange={(e) => setPassword1(e.target.value)} type="password" placeholder="Uusi salasana" />
        <Form.Control minlength="8" maxlength="100" required value={password2} onChange={(e) => setPassword2(e.target.value)} type="password" placeholder="Uusi salasana uudelleen" />
      </div>
      <Button type="submit">Muuta salasana</Button>
      {error ? <Alert variant="warning" className="text-start">{error}</Alert> : null}
    </Form>
  );
}

export default ResetPassword;