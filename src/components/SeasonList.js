import React from 'react';
import { NavDropdown, Spinner } from "react-bootstrap";
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import ApiError from './ApiError';
import { SimIcon } from './TrelleIcons';

function SeasonList() {
  const { data: seasons, error } = useSWR('/api/league/seasons');
  if (error) return <ApiError error={error} />;
  if (!seasons) return <Spinner />;

  return (
    <div style={{
      maxHeight: '300px',
      overflowY: 'scroll'
    }}>
      {seasons.map((s) => <NavDropdown.Item key={s.id} as={Link} to={`/tulospalvelu/kausi/${s.id}`}><SimIcon tag={s.game} /> {s.name}</NavDropdown.Item>)}
    </div>
  );
}

export default SeasonList;