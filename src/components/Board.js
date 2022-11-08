import React from 'react';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { decode } from 'html-entities';
import { Link } from 'react-router-dom';
import useSWR, { mutate } from 'swr';

import { IconPin, IconLock, IconChevronsRight } from '@tabler/icons';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';

import { ComposeThread } from './Compose';
import { useUserState } from './UserProvider';
import ApiError from './ApiError';
import { useEffect } from 'react';

const dtf = new Intl.DateTimeFormat('fi', { dateStyle: 'medium', timeStyle: 'short' });

// function ForumItem(props) {
//   const last_post_date = new Date(props.data.last_post_at);

//   return (
//     <tr>
//       <td>{props.data.is_sticky && <IconFlag className="me-2" />}<strong><Link to={`/board/thread/${props.data.id}`}>{decode(props.data.title)}</Link></strong></td>
//       {props.showForum && <td>{props.data.forum_name}</td>}
//       <td>{props.data.poster_name}</td>
//       <td>{dtf.format(last_post_date)}</td>
//       <td>{props.data.replies}</td>
//     </tr>
//   );
// }

function ForumItem(props) {
  const first_post_date = new Date(props.data.first_post_at);
  const last_post_date = new Date(props.data.last_post_at);

  return (
    <tr>
      <td>
        {props.data.is_sticky && <IconPin size="16px" className="me-2" />}
        {props.data.is_locked && <IconLock size="16px" className="me-2" />}
        <Link to={`/board/thread/${props.data.id}`}>{decode(props.data.title)}</Link>
        <div>
          {props.showForum && <small>{props.data.forum_name} </small>}
          <small className="text-muted">{props.data.poster_name}</small>
        </div>
      </td>

      {/* <td>{props.data.poster_name} @ </td> */}
      <td><Link to={`/board/thread/${props.data.id}#latest`}>{dtf.format(last_post_date)}</Link></td>
      <td className={'text-end' + (props.data.replies === 0 ? ' text-muted' : '')}>
        {props.data.replies}
      </td>
    </tr>
  );
}

function ForumSwitcher(props) {
  const forumId = props.forumId || '';
  let navigate = useNavigate();
  return (
    <Form.Select className="board-forum-select" value={forumId} onChange={(e) => {
      navigate(`/board/${e.target.value}`);
    }}>
      <option value="">Uusimmat viestit</option>
      {props.forumList.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
    </Form.Select>
  );
}

function ForumList(props) {
  const forumId = props.forumId || '';
  return (
    <ListGroup variant="flush">
      <ListGroup.Item action href={`/board`} active={forumId == ''}>Uusimmat viestit</ListGroup.Item>
      {props.forums.map((e) => <ListGroup.Item key={e.id} action href={`/board/${e.id}`} active={forumId == e.id}>{e.name}</ListGroup.Item>
      )}
    </ListGroup>
  );
}

export function Board({ forumId, showForumSwitcher = true }) {
  const dataUrl = forumId ? `/api/board/forum/${forumId}` : '/api/board/forum';
  const user = useUserState();
  const [showCompose, setShowCompose] = useState(false);
  const toggleShowCompose = () => setShowCompose((s) => !s);
  const { data: forums, error: forumsError } = useSWR('/api/board', { suspense: true });
  const { data, error: dataError } = useSWR(dataUrl, { suspense: true });

  if (forumsError) return <ApiError error={forumsError} />;
  if (dataError) return <ApiError error={dataError} />;

  function onNewThread() {
    setShowCompose(false);
    mutate(dataUrl);
  }



  return (
    <Row>
      {showForumSwitcher ? (
        <Col md="3" className="mb-3">
          <Card>
            <Card.Body>
              <ForumList forumId={forumId} forums={forums} />
            </Card.Body>
          </Card>
        </Col>
      ) : ''}
      <Col>
        <Card>
          <Card.Body>
            {/* {showForumSwitcher && <ForumSwitcher forumId={forumId} forumList={forums} />} */}
            {user && forumId && <div className="board-controls">
              <Button variant="primary" onClick={toggleShowCompose} className="me-2">
                Uusi keskustelu
              </Button>
            </div>}
            <ComposeThread forumId={forumId} onSuccess={onNewThread} show={showCompose} onClose={toggleShowCompose} />
            <Table className="align-middle" responsive>
              <thead>
                <tr>
                  <th></th>
                  <th>Viimeisin viesti</th>
                  <th className="text-end">Viestit</th>
                </tr>
              </thead>
              <tbody>
                {data.threads.map((e) => <ForumItem key={e.id} showForum={!forumId} data={e} />)}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

function BoardRoute(props) {
  let { forumId } = useParams();
  const user = useUserState();

  return <>
    {!user && <Alert variant="primary">Et ole kirjautunut sisään, joten suurin osa foorumeista ja viesteistä ei ole näkyvissä.</Alert>}

    <Board forumId={forumId} {...props} />

  </>;
}

export default BoardRoute;