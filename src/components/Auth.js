import React from 'react';
import { useState } from 'react';
import { request } from './_api';

import Alert from 'react-bootstrap/Alert';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Tab from 'react-bootstrap/Tab';
import Card from 'react-bootstrap/Card';

import ListGroup from 'react-bootstrap/ListGroup';
import { useNavigate } from 'react-router-dom';

import { useUserState, useUserDispatch } from './UserProvider';
import ApiError from './ApiError';

export function ForgotPasswordForm({ switchTab }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  async function sendRequest() {

    const result = await request('POST', 'user/requestPasswordReset', {
      email: email
    });

    if (result.status === 200) {
      return true;
    } else {
      throw new Error('Lähettämisessä tapahtui virhe. Yritä myöhemmin uudelleen.');
    }
  }

  return (
    <Card className="signin">
      <Card.Body>
        <Form className="d-grid gap-3" onSubmit={async (e) => {
          e.preventDefault();
          setSuccess(null);
          setError(null);
          setSending(true);
          try {
            if (await sendRequest()) {
              setError(null);
              setSuccess('Lähetetty.');
            }
          } catch (err) {
            setError(err.message);
          }
          setSending(false);
        }}>
          <h3 className="mb-3">Unohtunut salasana</h3>
          <p className="text-start">Sähköpostiin lähetetään linkki uuden salasanan asettamiseksi.</p>
          <div>
            <Form.Control value={email} required type="email" onChange={(e) => setEmail(e.target.value)} placeholder="Sähköpostiosoite" autoFocus />
          </div>
          <Button type="submit" disabled={sending}>Lähetä</Button>
          {success && <Alert variant="success" className="text-start">{success}</Alert>}
          {error && <ApiError error={error} />}
          <ListGroup variant="flush" className="text-start">
            <ListGroup.Item><Button variant="link" onClick={(e) => { switchTab('login'); }}>Takaisin kirjautumiseen</Button></ListGroup.Item>
          </ListGroup>
        </Form>
      </Card.Body>
    </Card>
  );
}

export function LoginForm({ switchTab, onSuccess }) {
  const userDispatch = useUserDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  async function sendLogin() {
    setSending(true);
    const result = await request('POST', 'user/login', {
      email: email,
      password: password
    });

    try {
      const data = await result.json();
      if (result.status === 200) {
        userDispatch({
          type: 'update',
          id: data.id,
          name: data.name,
          email: data.email
        });
        setError(null);
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/kirjaudu/ok');
        }
      } else {
        setError(data);
      }
    } catch (err) {
      setError(err);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <Alert variant="primary" className="text-start signin mb-3">
        <p>Trellet.net on siirtynyt sähköpostipohjaiseen kirjautumiseen. Turvallisuussyistä myös salasanat on nollattu.</p>
        <p>Jos tunnuksessasi oli vanhentunut sähköpostiosoite, ota yhteyttä ylläpitäjiin Discordissa.</p>
        <p>Klikkaa siis "Unohtunut salasana?" -nappia uuden salasanan asettamiseksi!</p>
      </Alert>

      <Card className="signin">
        <Card.Body>
          <Form className="d-grid gap-3" onSubmit={async (e) => {
            e.preventDefault();
            await sendLogin();
          }}>
            <h3 className="mb-3">Kirjaudu sisään</h3>

            <div>
              <Form.Control id="loginEmail" required value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Sähköpostiosoite" autoFocus />
              <Form.Control id="loginPassword" required minlength="8" maxlength="100" value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Salasana" />
            </div>
            <Button type="submit" disabled={sending}>Kirjaudu</Button>

            {success && <Alert variant="success" className="text-start">{success}</Alert>}
            {error && <ApiError error={error} />}
            <ListGroup variant="flush" className="text-start">
              <ListGroup.Item><Button variant="link" onClick={(e) => { switchTab('register'); }}>Luo Trellet.net -tili</Button></ListGroup.Item>
              <ListGroup.Item><Button variant="link" onClick={(e) => { switchTab('forgotpw'); }}>Unohtunut salasana?</Button></ListGroup.Item>
            </ListGroup>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
}

export function RegisterForm({ switchTab }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  async function sendRequest() {
    setSuccess(false);
    setError(false);
    if (password1 !== password2) {
      setError('Salasanat eivät täsmää.');
      return;
    }

    setSending(true);
    const result = await request('POST', 'user/signup', {
      email: email,
      name: name,
      password: password1
    });

    if (result.status === 200) {
      setSuccess('Rekisteröinti onnistui. Todennuslinkki on lähetetty sähköpostiin.');
      setError(null);
    } else if (result.status === 400) {
      setError('Tarkista kenttien oikeellisuus.');
    } else if (result.status === 403) {
      setError('Sähköpostiosoite on jo käytössä.');
    } else {
      setError('Rekisteröitymisessä tapahtui virhe. Yritä uudelleen myöhemmin.');
    }
    setSending(false);
  }

  return (
    <>
      <Alert variant="primary" className="text-start signin mb-3">
        <p>Käytä rekisteröityessäsi omaa koko nimeäsi.</p>
        <p>Jos nimesi on <i>Matti Meikäläinen</i>, rekisteröidy nimellä <i>Matti Meikäläinen</i>, ei <i>Matti M</i> tai <i>Matti Meikkis</i>.</p>
      </Alert>

      <Card className="signin">
        <Card.Body>
          <Form className="d-grid gap-3" onSubmit={async (e) => {
            e.preventDefault();
            await sendRequest();
          }}>
            <h3 className="mb-3">Liity Trellet.nettiin</h3>
            <div>
              <Form.Control required value={email} maxlength="100" onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Sähköpostiosoite" autoFocus />
              <Form.Control required value={name} minlength="6" maxlength="100" onChange={(e) => setName(e.target.value)} placeholder="Koko nimi" />
              <Form.Control required value={password1} maxlength="100" onChange={(e) => setPassword1(e.target.value)} type="password" minlength="8" placeholder="Salasana" />
              <Form.Control required value={password2} maxlength="100" onChange={(e) => setPassword2(e.target.value)} type="password" minlength="8" placeholder="Salasana uudelleen" />
            </div>
            <Button type="submit" disabled={sending}>Rekisteröidy</Button>
            {success ? <Alert variant="success" className="text-start">{success}</Alert> : null}
            {error ? <Alert variant="warning" className="text-start">{error}</Alert> : null}
            <ListGroup variant="flush" className="text-start">
              <ListGroup.Item><Button variant="link" onClick={(e) => { switchTab('login'); }}>Takaisin kirjautumiseen</Button></ListGroup.Item>
            </ListGroup>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
};

export default function Authenticate({ onSuccess = null }) {
  const [currentTab, setCurrentTab] = useState('login');
  function handleTab(key) {
    setCurrentTab(key);
  }
  return (
    <Tab.Container activeKey={currentTab} id="authenticate" onSelect={handleTab}>
      <Tab.Content>
        <Tab.Pane eventKey="login"><LoginForm switchTab={handleTab} onSuccess={onSuccess} /></Tab.Pane>
        <Tab.Pane eventKey="register"><RegisterForm switchTab={handleTab} /></Tab.Pane>
        <Tab.Pane eventKey="forgotpw"><ForgotPasswordForm switchTab={handleTab} /></Tab.Pane>
      </Tab.Content>
    </Tab.Container>
  );
}
