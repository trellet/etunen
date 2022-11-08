import React from 'react';
import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import ApiError from './ApiError';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Table from 'react-bootstrap/Table';
import { request } from './_api';

function DriverNumbers({ currentNumber, onChange }) {
  const [number, setNumber] = useState(currentNumber);
  const [info, setInfo] = useState(null);
  const [numberError, setNumberError] = useState(null);
  const apiUrl = '/api/user/driverNumbers';
  const { data, error } = useSWR(apiUrl, { suspense: true });

  if (error) return <ApiError error={error} />;

  async function updateNumber(e) {
    e.preventDefault();

    const sentNumber = number;
    try {
      const result = await request('POST', 'user/me', {
        driverNumber: sentNumber
      });

      if (result.status === 200) {
        setInfo('Muutokset tallennettu.');
        setNumberError(null);
        mutate(apiUrl);
        onChange(sentNumber);
      } else if (result.status === 400) {
        throw new Error('Numero ei ole valittavissa.');
      } else {
        throw new Error('Muutosten tallentaminen ei onnistunut. Yritä myöhemmin uudelleen.');
      }
    } catch (err) {
      setInfo(null);
      setNumberError(err.message);
    }
  }

  function handleNumber(val) {
    const num = parseInt(val);
    if (num > 0 && num < 1000) {
      setNumber(num);
    } else if (isNaN(num)) {
      setNumber('');
    }
  }

  return (
    <div>
      <div className="mb-3">
        Valittu numero:
        <Form.Control
          type="number"
          min={0} max={999}
          style={{ width: '100px', display: 'inline-block', marginLeft: '.5rem', marginRight: '.5rem' }}
          onChange={(e) => handleNumber(e.target.value)}
          value={number}
        />
        <Button onClick={updateNumber}>Varaa</Button>
        {numberError && <Alert variant="warning" className="mt-3 mb-3">{numberError}</Alert>}
        {info && <Alert variant="success" className="mt-3 mb-3">{info}</Alert>}
      </div>
      <h5>Varatut numerot</h5>
      <Table size="sm">
        <tbody>
          {data.map((e) => <tr><td>#{e.driver_number}</td><td>{e.name}</td></tr>)}
        </tbody>
      </Table>
    </div>
  );
}


export default DriverNumbers;