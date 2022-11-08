import React from 'react';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import useSWR, { mutate } from 'swr';
import { Link } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { request } from './_api';

function ResultTable({ results }) {
  return (
    <Table size="sm">
      <thead>
        <tr>
          <th>Id</th>
          <th>Kuski</th>
          <th>Pos</th>
          <th>Laps</th>
          <th>Lead</th>

          <th>Interval</th>
          <th>Avg Lap</th>
          <th>FL #</th>
          <th>FL Time</th>
          <th>Out</th>
          <th>Inc</th>
        </tr>
      </thead>
      <tbody>
        {results.map((entry, idx) => (
          <tr key={idx}>
            <td><Form.Control style={{ width: '80px', fontSize: '0.8em' }} defaultValue={entry.cust_id} /></td>
            <td><Form.Control style={{ width: '180px', fontSize: '0.8em' }} defaultValue={entry.display_name} /></td>
            <td><Form.Control style={{ width: '40px', fontSize: '0.8em' }} defaultValue={parseInt(entry.position) + 1} /></td>
            <td><Form.Control style={{ width: '60px', fontSize: '0.8em' }} defaultValue={entry.laps_complete} /></td>
            <td><Form.Control style={{ width: '40px', fontSize: '0.8em' }} defaultValue={entry.laps_lead} /></td>
            <td><Form.Control style={{ width: '80px', fontSize: '0.8em' }} defaultValue={entry.interval} /></td>
            <td><Form.Control style={{ width: '80px', fontSize: '0.8em' }} defaultValue={entry.average_lap} /></td>
            <td><Form.Control style={{ width: '40px', fontSize: '0.8em' }} defaultValue={entry.best_lap_num} /></td>
            <td><Form.Control style={{ width: '80px', fontSize: '0.8em' }} defaultValue={entry.best_lap_time} /></td>
            <td><Form.Control style={{ width: '', fontSize: '0.8em' }} defaultValue={entry.reason_out} /></td>
            <td><Form.Control style={{ width: '40px', fontSize: '0.8em' }} defaultValue={entry.incidents} /></td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}


function EventAdmin() {
  let { eventId } = useParams();
  const file = useRef();
  const [resultsFile, setResultsFile] = useState(null);
  const [ledLapPoints, setLedLapPoints] = useState(0);
  const [mostLedLapPoints, setMostLedLapPoints] = useState(0);
  const [polePoints, setPolePoints] = useState(0);
  const [pointDistribution, setPointDistribution] = useState('');

  const apiUrl = `/api/league/event/${eventId}`;
  const { data, error } = useSWR(apiUrl, { suspense: true });

  useEffect(() => {
    if (data && data.season && data.event) {
      document.title = `(Admin) ${data.event.name} - Trellet.net`;
      console.log(data);
      setPointDistribution(data.season.point_distribution);
      setLedLapPoints(data.season.points_ledLaps);
      setMostLedLapPoints(data.season.points_mostLedLaps);
      setPolePoints(data.season.points_pole);
    }
  }, [data]);

  async function parseFile() {
    const resultFile = file.current.files[0];
    const text = JSON.parse(await resultFile.text());
    setResultsFile(text);
  }

  async function send() {
    console.log(resultsFile);
    const result = await request('POST', `league/event/${eventId}/iRacingResults`, {
      resultFile: resultsFile,
      ledLapPoints: ledLapPoints,
      mostLedLapPoints: mostLedLapPoints,
      polePoints: polePoints,
      pointDistribution: pointDistribution
    });
  }

  return (
    <div>
      <Breadcrumb className="h2">
        <Breadcrumb.Item>
          <Link to={`/tulospalvelu/kausi/${data.season.id}`}>{data.season.name}</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to={`/tulospalvelu/kisa/${data.event.id}`}>{data.event.name}</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item active>
          Admin
        </Breadcrumb.Item>
      </Breadcrumb>

      <Card>
        <Card.Body>
          <Form.Group controlId="formFile" className="mb-3">
            <div class="row mb-3">
              <Form.Label className="col-sm-2 col-form-label">iRacing-tulokset (JSON)</Form.Label>
              <div className="col-sm-10">
                <Form.Control ref={file} type="file" onChange={parseFile} />
              </div>
            </div>
            <div class="row mb-3">
              <Form.Label className="col-sm-2 col-form-label">Pistelasku (CSV)</Form.Label>
              <div className="col-sm-10">
                <Form.Control required value={pointDistribution} onChange={(e) => setPointDistribution(e.target.value)} />
              </div>
            </div>
            <div class="row mb-3">
              <Form.Label className="col-sm-2 col-form-label">Pisteet: Led lap</Form.Label>
              <div className="col-sm-10">
                <Form.Control required value={ledLapPoints} onChange={(e) => setLedLapPoints(e.target.value)} />
              </div>
            </div>
            <div class="row mb-3">
              <Form.Label className="col-sm-2 col-form-label">Pisteet: Most laps led</Form.Label>
              <div className="col-sm-10">
                <Form.Control required value={mostLedLapPoints} onChange={(e) => setMostLedLapPoints(e.target.value)} />
              </div>
            </div>
            <div class="row mb-3">
              <Form.Label className="col-sm-2 col-form-label">Pisteet: Paalupaikka</Form.Label>
              <div className="col-sm-10">
                <Form.Control required value={polePoints} onChange={(e) => setPolePoints(e.target.value)} />
              </div>
            </div>
          </Form.Group>
          {resultsFile && <Button variant="primary" onClick={(e) => { send(); }}>Tallenna</Button>}
        </Card.Body>
      </Card>
    </div>
  );
}


export default EventAdmin;;