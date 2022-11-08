import React from 'react';
import { useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Navbar from 'react-bootstrap/Navbar';
import Image from 'react-bootstrap/Image';
import { Link } from 'react-router-dom';
import SeasonList from './SeasonList';

import { useUserState, useUserDispatch } from './UserProvider';
import { request } from './_api';

import logo from '../img/logo-blu.png';
import { IconNews, IconAlien, IconBrandDiscord, IconBrandYoutube, IconBrandTwitch, IconNotebook } from '@tabler/icons';
import { SimIcon } from './TrelleIcons';
import LogoTrellet from '../img/logo-icon.png';
const IconTrellet = () => <Image src={LogoTrellet} className="icon me-2" />;

async function getUserInfo() {
  try {
    const result = await request('GET', 'user/me');
    if (result.status === 200) {
      return await result.json();
    }
  } catch (error) {
    return null;
  }
}

async function logout() {
  const result = await request('POST', 'user/logout');
  if (result.status === 200) {
    return true;
  }
  return false;
}

function Profile(props) {
  const user = useUserState();
  const userDispatch = useUserDispatch();

  async function sendLogout() {
    await logout();
    userDispatch({ type: 'logout' });
  }

  return (
    <NavDropdown title={<><IconTrellet /> {user.name}</>}>
      <NavDropdown.Item as={Link} to="/trelle">Asetukset</NavDropdown.Item>
      <NavDropdown.Divider />
      <NavDropdown.Item onClick={(e) => sendLogout()}>Kirjaudu ulos</NavDropdown.Item>
    </NavDropdown>);
}

function Header() {
  const user = useUserState();
  const userDispatch = useUserDispatch();

  useEffect(() => {
    async function fetchUser() {
      const data = await getUserInfo();
      if (data) {
        userDispatch({
          type: 'update',
          id: data.id,
          name: data.name,
          email: data.email,
          level: data.level,
          iRacingId: data.iRacingId,
          driverNumber: data.driverNumber
        });
      }
    }
    fetchUser();
  }, [userDispatch]);


  return (
    <>
      <Navbar id="top" className="bg-brand" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand className="me-4" as={Link} to="/">
            <img src={logo} alt="Trellet.net" width="auto" height="32" className="d-inline-block align-center" />
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/board/50"><IconNews /> Arkisto</Nav.Link>
              <Nav.Link as={Link} to="/board"><IconAlien /> Trelleboard</Nav.Link>
              <Nav.Link href="https://drive.google.com/file/d/15TjtsAYkj1z8-3niOe9Vkjx12xVY1wjR/view"><IconNotebook /> Säännöt</Nav.Link>
              <Nav.Link href="https://discord.is/trellet"><IconBrandDiscord /> Discord</Nav.Link>
              <Nav.Link href="https://www.youtube.com/user/trellet"><IconBrandYoutube /> YouTube</Nav.Link>
              <Nav.Link href="https://www.twitch.tv/trellet/"><IconBrandTwitch /> Twitch</Nav.Link>
            </Nav>
            <Nav>
              {user ? <Profile user={user} /> : <Nav.Link as={Link} to="/kirjaudu" id="loginButton">Kirjaudu</Nav.Link>}
            </Nav>
          </Navbar.Collapse>

        </Container>
      </Navbar>
      <Navbar variant="dark" bg="dark" className="navbar-bottom" expand="sm">
        <Container>
          <Navbar.Toggle>Sarjat</Navbar.Toggle>
          <Navbar.Collapse>
            <Nav>
              <Nav.Link as={Link} to="/tulospalvelu/kausi/158" className="me-3"><SimIcon tag="IR" />Season 25: Trellet Cup Series</Nav.Link>
              <Nav.Link as={Link} to="/tulospalvelu/kausi/159" className="me-3"><SimIcon tag="IR" />Season 25: IndyCar Series</Nav.Link>
              <NavDropdown title={<><IconTrellet /> Muut sarjat</>} align="end">
                <SeasonList />
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default Header;