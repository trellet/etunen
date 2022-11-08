import React from 'react';
import Spinner from './Spinner';
import { decode } from 'html-entities';
import Card from 'react-bootstrap/Card';
import bbobReactRender from '@bbob/react/es/render';
import { ErrorBoundary } from 'react-error-boundary';
import presetReact from '@bbob/preset-react/es';
import ApiError from './ApiError';
import useSWR from 'swr';

const dtf = new Intl.DateTimeFormat('fi', { dateStyle: 'full' });
const bbobOptions = {
  onlyAllowTags: ['i', 'b', 'img', 'color', 'size', 'u', 'url', 'code', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'quote', 'fimg'],
  enableEscapeTags: true
};

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function PostError({ error }) {
  return (
    <Card.Body className="board-post-body" style={{ whiteSpace: "pre-wrap" }}>
      <i>Virhe uutisen näyttämisessä. :(</i>
    </Card.Body>
  );
}

function Post(props) {
  const date = new Date(props.created_at);
  return (
    <Card className="board-news-post board-post">
      <Card.Header className="board-news-post-header board-post-header d-flex">
        {props.title}
      </Card.Header>
      <ErrorBoundary FallbackComponent={PostError}>
        <Card.Body className="board-post-body" style={{ whiteSpace: "pre-wrap" }}>
          <p className="board-news-date">{capitalize(dtf.format(date))}</p>
          {bbobReactRender(decode(props.content), presetReact(), bbobOptions)}
        </Card.Body>
      </ErrorBoundary>
    </Card>
  );
}

function News() {
  const { data, error } = useSWR('/api/board/news');
  if (error) return <ApiError error={error} />;
  if (!data) return <Spinner />;

  const posts = data.map((e) => <Post key={e.id} {...e} />);

  return (
    <div>
      {posts}
    </div>
  );
}


export default News;;