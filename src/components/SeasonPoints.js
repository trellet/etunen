import React from 'react';
import { useParams } from 'react-router';
import useSWR from 'swr';
import SeasonNav from './SeasonNav';
import { SimIcon } from './TrelleIcons';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import ApiError from './ApiError';

function DriverTable({ data }) {
  return (
    <Table className="table-results" bordered>
      <thead>
        <tr>
          <td className="text-end"></td>
          <td style={{ minWidth: '200px' }}>Kuljettaja</td>
          {data.events.map((e, idx) => (
            <td className="text-center"><a href={`/tulospalvelu/kisa/${e.id}`}>{e.track_name?.slice(0, 3)?.toUpperCase()}</a></td>
          ))}
          <td className="text-center">Pisteet</td>
        </tr>
      </thead>
      <tbody>
        {data.driverStats.map((r, i) => (
          <tr>
            <td className="text-end">{i + 1}.</td>
            <td>{r.name}</td>
            {data.events.map((e, idx) => {
              // const pos = r.positions[e.id];
              const points = r.points[e.id] || '-';
              let cover = 'inherit';
              // if (pos === 1) {
              //   cover = 'rgba(212,175,55,0.2)';
              // } else if (pos === 2) {
              //   cover = 'rgba(128,128,128,0.2)';
              // } else if (pos === 3) {
              //   cover = 'rgba(156,82,33,0.2)';
              // } else if (!pos) {
              //   cover = 'rgba(0,0,0,0.2)';
              // }
              return (
                <td className="text-center">{points}</td>
              );
            })}
            <td className="table-points-total">{r.point_count}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function TeamTable({ data }) {
  return (
    <Table className="table-results" bordered>
      <thead>
        <tr>
          <td className="text-end"></td>
          <td style={{ minWidth: '200px' }}>Tiimi</td>
          {data.events.map((e, idx) => (
            <td className="text-center">{e.track_name?.slice(0, 3)?.toUpperCase()}</td>
          ))}
          <td className="text-center">Pisteet</td>
        </tr>
      </thead>
      <tbody>
        {data.teamStats.map((r, i) => (
          <tr>
            <td className="text-end">{i + 1}.</td>
            <td>{r.name}</td>
            {data.events.map((e, idx) => {
              return (
                <td className="text-center">{r.points[e.id]}</td>
              );
            })}
            <td className="table-points-total">{r.point_count}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function SeasonPoints() {
  let { seasonId } = useParams();
  const apiUrl = `/api/league/seasons/${seasonId}`;
  const { data, error } = useSWR(apiUrl, { suspense: true });
  if (error) return <ApiError error={error} />;

  return (
    <>
      <Card className="card-main">
        <Card.Header><SimIcon tag={data.season.game} /> {data.season.name}</Card.Header>
        <Card.Body>
          <SeasonNav seasonId={seasonId} active="pisteet">
            {data.driverStats.length > 0 && <DriverTable data={data} />}
            {data.teamStats.length > 0 && <TeamTable data={data} />}
          </SeasonNav>
        </Card.Body>
      </Card>
    </>
  );
}

export default SeasonPoints;