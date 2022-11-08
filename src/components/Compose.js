import React, { useState, useEffect, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Spinner from './Spinner';
import { request } from './_api';
// import raw from 'raw.macro';
// import { Editor } from '@tinymce/tinymce-react';
// eslint-disable-next-line no-unused-vars
// import tinymce from 'tinymce/tinymce';
// import 'tinymce/themes/silver';
// import 'tinymce/icons/default';
// import 'tinymce/skins/ui/oxide/skin.min.css';
// import 'tinymce/plugins/advlist';
// import 'tinymce/plugins/autolink';
// import 'tinymce/plugins/link';
// import 'tinymce/plugins/image';
// import 'tinymce/plugins/lists';
// import 'tinymce/plugins/anchor';
// import 'tinymce/plugins/searchreplace';
// import 'tinymce/plugins/code';
// import 'tinymce/plugins/bbcode';
// import 'tinymce/plugins/preview';

// const contentCss = raw('tinymce/skins/content/dark/content.min.css');
// const contentUiCss = raw('tinymce/skins/ui/oxide-dark/content.min.css');

// const Composer = ({ editorRef, initialValue }) => {
//   return <Editor
//     onInit={(e, editor) => editorRef.current = editor}
//     initialValue={initialValue}
//     init={{
//       skin: false,
//       content_css: false,
//       content_style: [contentCss, contentUiCss].join('\n'),
//       height: 300,
//       menubar: false,
//       plugins: 'bbcode code link autolink image lists preview searchreplace',
//       toolbar: 'undo redo searchreplace | bold italic underline | link image | code preview',
//       bbcode_dialect: 'punbb',
//       image_description: false,
//       image_dimensions: false,
//       default_link_target: '_blank',
//       link_title: false,
//       link_context_toolbar: true,
//       target_list: false,
//       resize: false,
//       branding: false,
//       elementpath: false,
//       statusbar: false,
//       relative_urls: false
//     }}
//   />;
// };


async function sendThread(forumId, title, content, onSuccess) {
  const result = await request('POST', `board/forum/${forumId}`, {
    title: title,
    content: content
  });
  if (result.status === 200) {
    onSuccess();
  }
}


async function sendPost(threadId, content, onSuccess) {
  const result = await request('POST', `board/thread/${threadId}`, {
    content: content
  });
  if (result.status === 200) {
    onSuccess();
  }
}


async function editPost(postId, content, onSuccess) {
  const result = await request('POST', `board/post/${postId}`, {
    content: content
  });
  if (result.status === 200) {
    onSuccess();
  }
}


export function ComposeThread({ forumId, show, onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [sending, setSending] = useState(false);
  const editorRef = useRef(null);

  const handleClose = () => onClose();

  async function send() {
    if (editorRef.current) {
      // const content = editorRef.current.getContent();
      const content = editorRef.current.value;
      setSending(true);
      await sendThread(forumId, title, content, onSuccess);
      setSending(false);
    }
  };

  if (sending) return <Spinner />;

  return (
    <>
      <Offcanvas
        show={show} onHide={handleClose} scroll={true}
        backdrop={false} placement="bottom" enforceFocus={false}
        autoFocus={false}
      >
        <Container>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title as="h6">Uusi keskustelu</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Form.Control className="mb-3" type="text" placeholder="Otsikko" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Form.Control ref={editorRef} as="textarea" rows={11} />
            <Button onClick={send} className="mt-3">Luo uusi keskustelu</Button>
          </Offcanvas.Body>
        </Container>
      </Offcanvas>
    </>
  );
}


export function Compose({ threadId, show, onClose, onSuccess, editId, editContent }) {
  const [sending, setSending] = useState(false);
  const editorRef = useRef(null);
  const [content, setContent] = useState('');

  const handleClose = () => onClose();

  useEffect(() => {
    setContent(editContent);
  }, [editContent]);

  async function send() {
    if (editorRef.current) {
      // const content = editorRef.current.getContent();
      const content = editorRef.current.value;
      setSending(true);
      if (!editId) {
        await sendPost(threadId, content, onSuccess);
      } else {
        await editPost(editId, content, onSuccess);
      }
      setSending(false);
    }
  };

  if (sending) return <Spinner />;
  return (
    <>
      <Offcanvas
        show={show} scroll={true} onHide={handleClose}
        backdrop={false} placement="bottom" enforceFocus={false}
        autoFocus={false}
      >
        <Container>
          <Offcanvas.Header closeButton>
            {!editId ? <Offcanvas.Title as="h6">Vastaa keskusteluun</Offcanvas.Title>
              : <Offcanvas.Title as="h6">Muokataan viestiä</Offcanvas.Title>}
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Form.Control
              ref={editorRef}
              as="textarea" rows={11}
              value={content}
              onChange={(e) => { setContent(e.target.value); }}
            />
            <Button onClick={send} className="mt-3">Lähetä viesti</Button>
          </Offcanvas.Body>
        </Container>
      </Offcanvas>
    </>
  );
}


export default Compose;