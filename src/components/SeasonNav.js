import React from 'react';
import Row from 'react-bootstrap/Row';
import Nav from 'react-bootstrap/Nav';
import Col from 'react-bootstrap/Col';
import { Link } from 'react-router-dom';


function SeasonNav({ seasonId, active, children }) {
  return (
    <>
      <Nav variant="pills" activeKey={active} className="mb-3">
        <Nav.Item>
          <Nav.Link eventKey="home" as={Link} to={`/tulospalvelu/kausi/${seasonId}`}>Kausi</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="pisteet" as={Link} to={`/tulospalvelu/kausi/${seasonId}/pisteet`}>Pistetilanne</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="ilmo" as={Link} to={`/tulospalvelu/kausi/${seasonId}/ilmo`}>Ilmoittautumiset</Nav.Link>
        </Nav.Item>
      </Nav>
      <div>{children}</div>
    </>
  );
}

export default SeasonNav;