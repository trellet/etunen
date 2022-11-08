import React from 'react';
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';
import { useUserState } from './UserProvider';
import DriverProfile from './DriverProfile';
import { request } from './_api';

import { FormControl, Modal } from 'react-bootstrap';

async function sendPasswordChange(oldPassword, newPassword) {
  const result = await request('POST', 'user/changePassword', {
    oldPassword: oldPassword,
    newPassword: newPassword
  });

  if (result.status === 200) {
    return true;
  } else if (result.status === 400) {
    throw new Error('Salasanan täytyy olla vähintään 8 merkkiä pitkä.');
  } else if (result.status === 401) {
    throw new Error('Väärä salasana.');
  } else {
    throw new Error('Salasanan vaihtaminen ei onnistunut. Yritä myöhemmin uudelleen.');
  }
}


function ChangePassword() {
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword1, setNewPassword1] = useState('');
  const [newPassword2, setNewPassword2] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (newPassword1 !== newPassword2) {
      setInfo(null);
      setError('Salasanat eivät täsmää.');
      return;
    }
    try {
      if (await sendPasswordChange(oldPassword, newPassword1)) {
        setInfo('Salasana vaihdettu onnistuneesti.');
        setError(null);
      }
    } catch (err) {
      setInfo(null);
      setError(err.message);
    }
  }

  return (
    <>
      <Form onSubmit={handleSubmit} className="mb-3">
        <Form.Control minlength="8" maxlength="100" required value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="mb-2" type="password" placeholder="Vanha salasana" />
        <Form.Control minlength="8" maxlength="100" required value={newPassword1} onChange={(e) => setNewPassword1(e.target.value)} className="mb-2" type="password" placeholder="Uusi salasana" />
        <Form.Control minlength="8" maxlength="100" required value={newPassword2} onChange={(e) => setNewPassword2(e.target.value)} className="mb-2" type="password" placeholder="Uusi salasana uudelleen" />
        <Button type="submit">Vaihda salasana</Button>
      </Form>
      {error && <Alert variant="warning" className="mb-3">{error}</Alert>}
      {info && <Alert variant="success" className="mb-3">{info}</Alert>}
    </>
  );
}



function Profile() {
  const user = useUserState();

  if (!user) return <p>Et ole kirjautunut sisään.</p>;

  return (
    <div>
      <h2 className="mb-3">{user.name}</h2>
      <Card className="mb-3">
        <Card.Header>Kuljettajan tiedot</Card.Header>
        <Card.Body>
          <DriverProfile user={user} />
        </Card.Body>
      </Card>
      <Card>
        <Card.Header>Salasanan vaihtaminen</Card.Header>
        <Card.Body>
          <ChangePassword />
        </Card.Body>
      </Card>
    </div>
  );
}

export default Profile;