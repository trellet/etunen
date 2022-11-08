import React from 'react';
import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import { request } from './_api';
import DriverNumbers from './DriverNumbers';

function DriverProfile({ user }) {
  const [iRacingId, setIRacingId] = useState(user.iRacingId);
  const [DriverNumber, setDriverNumber] = useState(user.driverNumber);
  const [showNumberPicker, setShowNumberPicker] = useState(false);
  const [iRacingIdError, setIRacingIdError] = useState(null);
  const [info, setInfo] = useState(null);

  const openNumberPicker = () => setShowNumberPicker(true);
  const closeNumberPicker = () => setShowNumberPicker(false);

  async function updateIRacingId(e) {
    e.preventDefault();

    try {
      const result = await request('POST', 'user/me', {
        iRacingId: iRacingId
      });

      if (result.status === 200) {
        setInfo('Muutokset tallennettu.');
        setIRacingIdError(null);
      } else if (result.status === 400) {
        throw new Error('Tunnus ei ole oikeassa muodossa.');
      } else {
        throw new Error('Muutosten tallentaminen ei onnistunut. Yritä myöhemmin uudelleen.');
      }
    } catch (err) {
      setInfo(null);
      setIRacingIdError(err.message);
    }
  }

  return (
    <>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label style={{ display: 'block' }}>iRacing-tunnus (Customer ID)</Form.Label>
          <Form.Control
            style={{ width: '100px', display: 'inline-block', marginRight: '.5rem' }}
            placeholder="Esim. 107107"
            value={iRacingId}
            onChange={(e) => setIRacingId(parseInt(e.target.value) || '')}
          />
          <Button variant="secondary" onClick={updateIRacingId}>Tallenna</Button>
          {iRacingIdError && <Alert variant="warning" className="mt-3 mb-3">{iRacingIdError}</Alert>}
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label style={{ display: 'block' }}>Kuljettajan numero</Form.Label>
          <Form.Control disabled
            style={{ width: '100px', display: 'inline-block', marginRight: '.5rem' }}
            value={DriverNumber}
          />
          <Button variant="secondary" onClick={openNumberPicker}>Avaa numerovalinta</Button>
        </Form.Group>
      </Form>

      {info && <Alert variant="success" className="mt-3 mb-3">{info}</Alert>}
      <Modal show={showNumberPicker} onHide={closeNumberPicker}>
        <Modal.Header closeButton>
          <Modal.Title>Kuljettajan numeron valinta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <DriverNumbers currentNumber={DriverNumber} onChange={(num) => setDriverNumber(num)} />
        </Modal.Body>
      </Modal>
    </>
  );
}


export default DriverProfile;