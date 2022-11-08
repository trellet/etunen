import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import { Board } from './Board';
import useSWR from 'swr';
import ApiError from './ApiError';
import SeasonNav from './SeasonNav';
import { SimIcon } from './TrelleIcons';
import Card from 'react-bootstrap/Card';

const dateFormat = new Intl.DateTimeFormat('fi');

function EventItem(props) {
  const date = new Date(props.race_date);
  return (
    <tr key={props.id}>
      <td className="text-end">{dateFormat.format(date)}</td>
      <td><Link to={`/tulospalvelu/kisa/${props.id}`}>{props.name}</Link></td>
      <td>{props.track_name}{props.track_layout ? <> ({props.track_layout})</> : null}</td>
    </tr>
  );
}

function EventList(props) {
  const data = props.data;
  return (
    <>
      <Table className="table-races">
        <thead>
          <tr>
            <th className="text-end">Pvm</th>
            <th>Kisa</th>
            <th>Rata</th>
          </tr>
        </thead>
        <tbody>
          {data.events.map((e) => <EventItem key={e.id} {...e} />)}
        </tbody>
      </Table>
    </>
  );
}

function Season() {
  let { seasonId } = useParams();
  const apiUrl = `/api/league/seasons/${seasonId}`;
  const { data, error } = useSWR(apiUrl, { suspense: true });

  if (error) return <ApiError error={error} />;

  document.title = `${data.season.name} - Trellet.net`;

  return (
    <>
      <Card className="mb-3">
        <Card.Header><SimIcon tag={data.season.game} /> {data.season.name}</Card.Header>
        <Card.Body>
          <SeasonNav seasonId={seasonId} active="home" className="mb-3">
            <EventList data={data} />
          </SeasonNav>
        </Card.Body>
      </Card>
      <Card>
        <Card.Header>Board</Card.Header>
        <Card.Body>
          {data.season.forum_id && <Board forumId={data.season.forum_id} showForumSwitcher={false} />}
        </Card.Body>
      </Card>
    </>
  );
}




export default Season;