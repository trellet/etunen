import React from 'react';
import { useState, lazy, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Image from 'react-bootstrap/Image';
import presetReact from '@bbob/preset-react/es';
import { decode } from 'html-entities';
import useSWR, { mutate } from 'swr';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { ErrorBoundary } from 'react-error-boundary';
import Button from 'react-bootstrap/Button';
import Popover from 'react-bootstrap/Popover';
import bbobReactRender from '@bbob/react/es/render';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

import { request } from './_api';
import ApiError from './ApiError';
import { IconLock, IconTrash, IconLockOpen, IconEdit, IconPinned, IconPinnedOff } from '@tabler/icons';
import { useUserState } from './UserProvider';
import Authenticate from './Auth';

import DELETE from '../img/delete.gif';
import Spinner from './Spinner';
import LogoTrellet from '../img/logo-icon.png';

const IconTrellet = () => <Image src={LogoTrellet} className="icon me-2" />;

const Compose = lazy(() => import('./Compose'));

const dtf = new Intl.DateTimeFormat('fi', { dateStyle: 'long', timeStyle: 'medium' });

const bbobOptions = {
  onlyAllowTags: ['i', 'b', 'img', 'color', 'size', 'u', 'url', 'code', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'quote', 'fimg'],
  enableEscapeTags: true
};

async function deleteThread(threadId) {
  const result = await request('DELETE', `board/thread/${threadId}`);
  if (result.status === 200) {
    mutate(`/api/board/thread/${threadId}`);
  }
}


async function deletePost(postId) {
  const result = await request('DELETE', `board/post/${postId}`);
  if (result.status === 200) {
    mutate(`/api/board/thread/${postId}`);
  }
}


async function lockThread(threadId, newState) {
  const result = await request('POST', `board/thread/${threadId}/lock`, {
    locked: newState
  });
  if (result.status === 200) {
    mutate(`/api/board/thread/${threadId}`);
  }
}


async function pinThread(threadId, newState) {
  const result = await request('POST', `board/thread/${threadId}/pin`, {
    pinned: newState
  });
  if (result.status === 200) {
    mutate(`/api/board/thread/${threadId}`);
  }
}


function PostError({ error }) {
  return (
    <Card.Body className="board-post-body" style={{ whiteSpace: "pre-wrap" }}><i>Virhe viestin näyttämisessä. :(</i>
    </Card.Body>
  );
}


function Post(props) {
  const user = useUserState();
  const date = new Date(props.created_at);
  const ownPost = user && user.id === props.user_id;

  const PostDeleteOverlay = (
    <Popover>
      <Popover.Header>Poistetaanko viesti?</Popover.Header>
      <Popover.Body>
        <div className="mb-3"><Image src={DELETE} fluid /></div>
        <div>
          <Button variant="danger" onClick={(e) => { deletePost(props.id); }}>
            Poista
          </Button>
        </div>
      </Popover.Body>
    </Popover>);

  return (
    <Card id={`post-${props.id}`} className="board-post">
      <ErrorBoundary FallbackComponent={PostError}>
        <Card.Header className="board-post-header d-flex align-items-center">
          <div className="board-post-user flex-grow-1">
            <IconTrellet /> {props.user_name}
          </div>
          <div>
            {(ownPost || user?.isModerator) && <Button variant="link" size="sm" onClick={(e) => { props.onEdit(props.content); }}>(Muokkaa)</Button>}
            {(ownPost || user?.isModerator) &&
              <OverlayTrigger trigger="click" placement="left" overlay={PostDeleteOverlay}>
                <Button variant="link" size="sm">(Poista)</Button>
              </OverlayTrigger>}
            {dtf.format(date)}

          </div>
        </Card.Header>

        <Card.Body className="board-post-body" style={{ whiteSpace: "pre-wrap" }}>
          {bbobReactRender(decode(props.content), presetReact(), bbobOptions)}
        </Card.Body>
      </ErrorBoundary>
    </Card>
  );
}


function Controls({ threadId, composeReply, isLocked, isPinned }) {
  const user = useUserState();

  const DeleteOverlay = (
    <Popover>
      <Popover.Header>Poistetaanko keskustelu?</Popover.Header>
      <Popover.Body>
        <div className="mb-3"><Image src={DELETE} fluid /></div>
        <div><Button variant="danger" onClick={(e) => {
          deleteThread(threadId);
        }}>
          Poista
        </Button>
        </div>
      </Popover.Body>
    </Popover>);

  return (
    <div className="board-controls">
      {user && user.isModerator && (<>
        <OverlayTrigger trigger="click" placement="bottom" overlay={DeleteOverlay}>
          <Button variant="secondary"><IconTrash /></Button>
        </OverlayTrigger>{' '}
        {isLocked
          ? <Button variant="secondary" onClick={(e) => { lockThread(threadId, false); }}><IconLock /></Button>
          : <Button variant="secondary" onClick={(e) => { lockThread(threadId, true); }}><IconLockOpen /></Button>
        }{' '}
        {isPinned
          ? <Button variant="secondary" onClick={(e) => { pinThread(threadId, false); }}><IconPinned /></Button>
          : <Button variant="secondary" onClick={(e) => { pinThread(threadId, true); }}><IconPinnedOff /></Button>
        }{' '}
      </>)
      }
      {user && !isLocked && <Button variant="primary" onClick={composeReply} className="me-2">Vastaa</Button>}
      {isLocked && <Button variant="disabled">Lukittu</Button>}

    </div >
  );
}


function Thread(props) {
  const user = useUserState();
  let { threadId } = useParams();
  const apiUrl = `/api/board/thread/${threadId}`;
  const toggleShowCompose = () => setShowCompose((s) => !s);
  const latestPost = useRef(null);

  const { data: thread, error, isValidating } = useSWR(apiUrl);
  const [showCompose, setShowCompose] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    if (thread) document.title = `${thread.info.title} - Trellet.net`;
    if (latestPost.current && window.location.hash === '#latest') {
      latestPost.current.scrollIntoView();
    }
  });

  function composeReply() {
    setEditId(null);
    setEditContent('');
    setShowCompose(true);
  }

  function onReply() {
    window.location.href = "#latest";
    mutate(apiUrl);
    setShowCompose(false);
  }

  function composeEdit(postId, content) {
    setEditId(postId);
    setEditContent(content);
    setShowCompose(true);
  }

  if (error) {
    if (error.status === 403 && !user) return <Authenticate onSuccess={() => { mutate(`/api/board/thread/${threadId}`); }} />;
    return <ApiError error={error} />;
  }

  if (isValidating) return <Spinner />;
  if (!thread) return <ApiError error={{ message: 'Keskustelua ei löytynyt.' }} />;

  const posts = thread.posts.map((e) => <Post key={e.id} onEdit={(evt) => { composeEdit(e.id, e.content); }} {...e} />);
  return (
    <div>
      <Breadcrumb as="h4">
        <Breadcrumb.Item><Link to={`/board`}>Board</Link></Breadcrumb.Item>
        <Breadcrumb.Item><Link to={`/board/${thread.info.forum_id}`}>{thread.info.forum_name}</Link></Breadcrumb.Item>
        <Breadcrumb.Item active>{decode(thread.info.title)}</Breadcrumb.Item>
      </Breadcrumb>
      <Controls threadId={threadId} composeReply={composeReply} isLocked={thread.info.is_locked} isPinned={thread.info.is_sticky} />
      <Compose
        threadId={thread.info.id}
        editId={editId}
        editContent={editContent}
        onSuccess={onReply}
        show={showCompose}
        onClose={toggleShowCompose}
      />
      <div className="board-posts">{posts}</div>
      <div id="latest" ref={latestPost} />
      <Controls threadId={threadId} composeReply={composeReply} isLocked={thread.info.is_locked} isPinned={thread.info.is_sticky} />
    </div>
  );
}

export default Thread;