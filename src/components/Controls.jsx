import React from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import './control.css'; // Import the CSS file

const Controls = ({ region, setRegion, seed, setSeed, avgLikes, setAvgLikes, avgReviews, setAvgReviews }) => {
  return (
    <Form className="controls-container">
      <Row>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Region</Form.Label>
            <Form.Select value={region} onChange={(e) => setRegion(e.target.value)}>
              <option value="en_US">English (USA)</option>
              <option value="de_DE">German (Germany)</option>
              <option value="fr_FR">French (France)</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Seed</Form.Label>
            <Form.Control type="number" value={seed} onChange={(e) => setSeed(Number(e.target.value))} />
            <Button variant="secondary" onClick={() => setSeed(Math.floor(Math.random() * 1000000))}>
              Random Seed
            </Button>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Average Likes: {avgLikes}</Form.Label>
            <Form.Range 
              min="0" 
              max="10" 
              step="0.1" 
              value={avgLikes} 
              onChange={(e) => setAvgLikes(Number(e.target.value))} 
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Average Reviews</Form.Label>
            <Form.Control type="number" step="0.1" value={avgReviews} onChange={(e) => setAvgReviews(Number(e.target.value))} />
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );
};

export default Controls;