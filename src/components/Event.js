import React from 'react';
import { useParams } from 'react-router';
import Table from 'react-bootstrap/Table';
import useSWR, { mutate } from 'swr';
import ApiError from './ApiError';
import { IconBed, IconX, IconCircleCheck, IconUserCheck, IconClock, IconAlarm } from '@tabler/icons';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import { Link } from 'react-router-dom';
import { useUserState } from './UserProvider';
import { request } from './_api';
import { useEffect, useState } from 'react';
import Spinner from './Spinner';
import Card from 'react-bootstrap/Card';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';

const regDateFormat = new Intl.DateTimeFormat('fi', { dateStyle: 'medium', timeStyle: 'short' });

function _getUserFromRegs(regs, userId) {
  return regs.reduce((a, v) => (v.user_id === userId ? v : a), null);
}

function lapTime(timeInt) {
  if (timeInt <= 0) return null;
  const is = Math.floor(timeInt / 10000) % 60;
  const im = Math.floor(timeInt / 10000 / 60);
  const ims = Math.floor(timeInt % 10000 / 10);
  const s = is.toString().padStart(2, "0");
  const m = im.toString();
  const ms = ims.toString().padStart(3, "0");
  if (is < 60 && im === 0) return `${is}.${ms}`;

  return `${m}:${s}.${ms}`;
}

function RegIcon({ type }) {
  switch (type) {
    case 'yes':
      return <IconCircleCheck />;
    case 'no':
    case 'cancel':
      return <IconX />;
    default:
      return <IconBed />;
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
  const data = props.data;
  const user = useUserState();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  let startDate, startDateSpares, endDate, regControls = null;

  if (data.event.reg_starts_on) startDate = new Date(data.event.reg_starts_on);
  if (data.event.reg_starts_on_spares) startDateSpares = new Date(data.event.reg_starts_on_spares);
  if (data.event.reg_ends_on) endDate = new Date(data.event.reg_ends_on);

  async function _sendReg(type) {
    setSending(true);
    await request('POST', `league/eventRegs/${data.event.id}`, {
      regType: type
    });
    await mutate(`/api/league/event/${data.event.id}`);
    setSending(false);
  }

  if (user && data.regsActiveForUser) {
    const userReg = _getUserFromRegs(data.regs, user.id);

    if (!userReg || (userReg && userReg.type !== 'yes')) {
      regControls = (
        <ButtonGroup className="mb-3">
          <ToggleButton type="radio" name="radio" variant="outline-primary" onClick={(e) => { _sendReg('yes'); }}><IconCircleCheck /> Osallistun</ToggleButton>
          <ToggleButton type="radio" name="radio" variant="outline-primary" onClick={(e) => { _sendReg('no'); }}><IconX /> En osallistu</ToggleButton>
        </ButtonGroup>
      );
    } else {
      regControls = (
        <ButtonGroup className="mb-3">
          <ToggleButton type="radio" name="radio" variant="outline-primary" onClick={(e) => { _sendReg('cancel'); }}><IconBed /> Peru ilmoittautuminen</ToggleButton>
        </ButtonGroup>
      );
    }
  }

  return (
    <>
      <p><IconUserCheck /> Ilmoittautuneet: <strong>{data.regCount}</strong> (max <strong>{data.event.max_drivers}</strong>)</p>
      {startDate && <p><IconClock /> Alkaa vakikuljettajille: {regDateFormat.format(startDate)}</p>}
      {startDate && <p><IconClock /> Alkaa varakuljettajille: {regDateFormat.format(startDateSpares)}</p>}
      {endDate && <p><IconAlarm /> Loppuu: {regDateFormat.format(endDate)}</p>}
      {!sending ? regControls : <Spinner />}
      {error && <ApiError error={error} />}
      <Table className="w-auto" size="sm">
        <tbody>
          {data.regs.map((e, idx) => <RegItem key={idx} highlight={user?.id} {...e} />)}
        </tbody>
      </Table>
    </>
  );
}


function SessionResults({ type, results }) {
  if (!results) return null;
  return (
    <Table className="table-results mt-3" size="sm">
      <thead>
        <tr>
          <td className="text-end">Sij.</td>
          <td>Nimi</td>
          <td>Tiimi</td>
          <td className="text-end">Ero</td>
          <td className="text-end">Kier.</td>
          {type === 'RACE' && <td className="text-end">Johtokier.</td>}
          <td className="text-end">Nopein aika</td>
          {type === 'RACE' && <td className="text-end">Lähtö</td>}
          <td className="text-end">Inc</td>
        </tr>
      </thead>
      <tbody>
        {results.map((r) => (
          <tr>
            <td className="text-end">{r.position}.</td>
            <td>{r.driver_name}</td>
            <td>{r.team_name ? r.team_name : '-'}</td>
            <td className="text-end">{lapTime(r.interval)}</td>
            <td className="text-end">{r.laps_complete}</td>
            {type === 'RACE' && <td className="text-end">{r.laps_lead}</td>}
            <td className="text-end">{lapTime(r.best_lap_time)}</td>
            {type === 'RACE' && <td className="text-end">{r.starting_position ? r.starting_position + '.' : '-'}</td>}
            <td className="text-end">{r.incidents}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}


function Results({ data }) {
  return (
    <Tabs>
      {data.sessions.map(sess => {
        return (
          <Tab eventKey={sess.session_id} title={sess.session_type}>
            <Card className="mb-3">
              <Card.Body>
                <SessionResults type={sess.session_name} results={data.results[sess.session_id]} />
              </Card.Body>
            </Card>
          </Tab>
        );
      })}
    </Tabs>
  );
}


function Event() {
  let { eventId } = useParams();
  const apiUrl = `/api/league/event/${eventId}`;
  const { data, error } = useSWR(apiUrl, { suspense: true });

  useEffect(() => {
    if (data && data.event) {
      document.title = `${data.event.name} - Trellet.net`;
    }
  }, [data]);

  if (error) return <ApiError error={error} />;

  return (
    <div>
      <Breadcrumb className="h2">
        <Breadcrumb.Item>
          <Link to={`/tulospalvelu/kausi/${data.season.id}`}>{data.season.name}</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item active>
          {data.event.name}
        </Breadcrumb.Item>
      </Breadcrumb>
      {data.event.sessions.length > 0 && (
        // <Card className="mb-3">
        //   <Card.Body>
        <Results data={data.event} />
        //   </Card.Body>
        // </Card>
      )}
      <Card className="card-main mb-3">
        <Card.Header>Ilmoittautumiset</Card.Header>
        <Card.Body>
          <RegList data={data} />
        </Card.Body>
      </Card>
    </div>
  );
}


export default Event;