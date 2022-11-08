import React from 'react';
import { useState } from 'react';
import { useParams } from 'react-router';
import Table from 'react-bootstrap/Table';
import useSWR, { mutate } from 'swr';
import SeasonNav from './SeasonNav';
import ApiError from './ApiError';
import { IconCircle, IconCircleCheck, IconX, IconUserCheck, IconClock, IconAlarm, IconNotebook } from '@tabler/icons';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import { request } from './_api';
import DriverProfile from './DriverProfile';
import Spinner from './Spinner';
import { SimIcon } from './TrelleIcons';
import { useUserState } from './UserProvider';
import Card from 'react-bootstrap/Card';
import { Form } from 'react-bootstrap';

const regDateFormat = new Intl.DateTimeFormat('fi', { dateStyle: 'medium', timeStyle: 'short' });


function _getUserFromRegs(regs, userId) {
  return regs.reduce((a, v) => (v.user_id === userId ? v : a), null);
}

function RegIcon({ type }) {
  switch (type) {
    case 'full':
      return <IconCircleCheck />;
    case 'spare':
      return <IconCircle />;
    default:
      return <IconX />;
  }
}

function RegItem(props) {
  const date = new Date(props.updated_at);
  return (
    <tr key={props.id} className={props.highlight === props.user_id ? 'text-light bg-success' : ''}>
      <td><RegIcon type={props.type} /></td>
      <td style={{ minWidth: '240px' }}>{props.user_name}</td>
      <td className="text-end">{regDateFormat.format(date)}</td>
    </tr>
  );
}

function RegList(props) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const user = useUserState();
  const data = props.data;

  let startDate, endDate, regControls = null;
  if (data.season.reg_starts_on) startDate = new Date(data.season.reg_starts_on);
  if (data.season.reg_ends_on) endDate = new Date(data.season.reg_ends_on);

  async function _sendReg(type) {
    setSending(true);
    setError(false);
    try {
      const result = await request('POST', `league/seasonRegs/${data.season.id}`, {
        regType: type
      });
      if (result.status >= 400) setError(await result.json());
    } catch (err) {
      console.log(err);
      setError(err);
    }

    await mutate(`/api/league/seasons/${data.season.id}`);
    setSending(false);
  }

  if (user && data.regsActiveForUser) {
    const userReg = _getUserFromRegs(data.regs, user.id);

    if (!userReg || (userReg && userReg.type === 'cancel')) {
      regControls = (
        <div>
          <p>Tarkista ennen kisoihin osallistumista, että olet varannut numeron ja asettanut iRacing-tunnuksen profiiliisi. Näitä voit myös muuttaa myöhemmin <a href="/trelle">profiilin asetuksista</a>.</p>
          <p><a href="https://drive.google.com/file/d/15TjtsAYkj1z8-3niOe9Vkjx12xVY1wjR/view"><IconNotebook /> Trellet.net Yleissäännöt</a></p>
          <DriverProfile user={user} />
          <Form.Group className="mb-3">
            <ButtonGroup>
              <ToggleButton type="radio" name="radio" variant="outline-primary" onClick={(e) => { _sendReg('full'); }}>
                <IconCircleCheck /> Ilmoittaudu vakikuljettajaksi
              </ToggleButton>
              <ToggleButton type="radio" name="radio" variant="outline-primary" onClick={(e) => { _sendReg('spare'); }}>
                <IconCircle /> Ilmoittaudu varakuljettajaksi
              </ToggleButton>
            </ButtonGroup>
          </Form.Group>
        </div>
      );
    } else {
      regControls = (
        <ButtonGroup className="mb-3">
          <ToggleButton type="radio" name="radio" variant="outline-primary" onClick={(e) => { _sendReg('cancel'); }}><IconX /> Peru ilmoittautuminen</ToggleButton>
        </ButtonGroup>
      );
    }
  }

  return (
    <>
      <p><IconUserCheck /> Ilmoittautuneet: <strong>{data.regCount}</strong> (max <strong>{data.season.max_drivers}</strong>) + <strong>{data.regSpareCount}</strong> varalla</p>
      {startDate && <p><IconClock /> Alkaa: {regDateFormat.format(startDate)}</p>}
      {endDate && <p><IconAlarm /> Loppuu: {regDateFormat.format(endDate)}</p>}
      {!sending ? regControls : <Spinner />}
      {error && <ApiError error={error} />}

      <Table size="sm" className="w-auto">
        <tbody>
          {data.regs.map((e) => <RegItem highlight={user?.id} key={e.id} {...e} />)}
        </tbody>
      </Table>
    </>
  );
}


function SeasonRegs() {
  let { seasonId } = useParams();
  const apiUrl = `/api/league/seasons/${seasonId}`;
  const { data, error } = useSWR(apiUrl, { suspense: true, refreshInterval: 2000 });

  if (error) return <ApiError error={error} />;

  return (
    <>
      <Card className="card-main">
        <Card.Header><SimIcon tag={data.season.game} /> {data.season.name}</Card.Header>
        <Card.Body>
          <SeasonNav seasonId={seasonId} active="ilmo">
            <RegList data={data} />
          </SeasonNav>
        </Card.Body>
      </Card>
    </>
  );
}

export default SeasonRegs;;