import React from 'react';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import News from './News';
import { useEffect } from 'react';

function Home() {

  useEffect(() => {
    const twitterScript = document.createElement('script');
    twitterScript.src = 'https://platform.twitter.com/widgets.js';
    twitterScript.async = true;
    document.body.appendChild(twitterScript);
    document.title = 'Etusivu - Trellet.net';
  });

  return (
    <>
      <Card className="mb-3" border="primary">
        <Card.Body>
          <Card.Title className="text-primary mb-3">Tervetuloa Trellet.net Beta UI:hin!</Card.Title>
          <Card.Text>
            Trellet.net on suomalainen simuautoiluun keskittyvä yhteisö, joka sai alkunsa Grand Prix Legends-simulaattorin parissa jo vuonna 2001. Sarjoja on ajettu aikojen kuluessa mm. Papyruksen Nascar -sarjan simulaattoreilla, rFactorin eri versiolla, Assetto Corsalla ja monilla muilla aikansa hypetuotteilla. Viime vuodet on käytössä ollut lähinnä iRacing.
          </Card.Text>
        </Card.Body>
      </Card>
      <Row>
        <Col>
          <News />
        </Col>
        <Col md={4}>
          <a class="twitter-timeline" data-height="800" href="https://twitter.com/trellet?ref_src=twsrc%5Etfw">Tweets by trellet</a>
        </Col>
      </Row>
    </>
  );
}

export default Home;