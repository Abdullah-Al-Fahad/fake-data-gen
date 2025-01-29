import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Container, Button, Spinner, Row, Col, Toast } from 'react-bootstrap';
import Controls from './components/Controls';
import BookTable from './components/BookTable';
import BookGallery from './components/BookGallery';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App = () => {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState('en_US');
  const [seed, setSeed] = useState(Math.floor(Math.random() * 1000000));
  const [avgLikes, setAvgLikes] = useState(5);
  const [avgReviews, setAvgReviews] = useState(5);
  const [view, setView] = useState('table');
  const [showToast, setShowToast] = useState(false);

  const fetchBooks = useCallback(async (page) => {
    setLoading(true);
    try {
      const response = await axios.get('https://fake-data-gen.onrender.com/api/books', {
        params: {
          language: region.split('_')[0],
          seed,
          likes: avgLikes,
          reviews: avgReviews,
          page: page + 1,
        },
      });
      setBooks((prev) => [...prev, ...response.data]);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  }, [seed, region, avgLikes, avgReviews]);

  const handleGenerate = () => {
    setBooks([]);
    setPage(0);
    fetchBooks(0);
  };

  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 10 && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading]);

  useEffect(() => {
    if (page > 0) {
      fetchBooks(page);
    }
  }, [page, fetchBooks]);

  const exportToCSV = () => {
    const csv = books.map((book) => ({
      ISBN: book.isbn,
      Title: book.title,
      Author: book.author,
      Publisher: book.publisher,
      Likes: book.likes,
      Reviews: book.reviews.map((review) => `${review.text} - ${review.author}`).join('; '),
    }));
    const csvContent = "data:text/csv;charset=utf-8," + csv.map((row) => Object.values(row).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encodedUri;
    link.download = 'books.csv';
    link.click();
    setShowToast(true);
  };

  return (
    <Container fluid>
      <div className="sticky-toolbar">
        <Row className="align-items-center">
          <Col md={8}>
            <Controls
              region={region}
              setRegion={setRegion}
              seed={seed}
              setSeed={setSeed}
              avgLikes={avgLikes}
              setAvgLikes={setAvgLikes}
              avgReviews={avgReviews}
              setAvgReviews={setAvgReviews}
              onGenerate={handleGenerate}
            />
          </Col>
          <Col md={4} className="text-end">
            <Button variant="primary" onClick={() => setView(view === 'table' ? 'gallery' : 'table')}>
              Switch to {view === 'table' ? 'Gallery View' : 'Table View'}
            </Button>
            <Button variant="success" onClick={exportToCSV} className="ms-2">
              Export to CSV
            </Button>
          </Col>
        </Row>
      </div>

      {view === 'table' ? <BookTable books={books} /> : <BookGallery books={books} />}

      {loading && (
        <div className="text-center my-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}

      <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide className="position-fixed bottom-0 end-0 m-3">
        <Toast.Header>
          <strong className="me-auto">Export Successful</strong>
        </Toast.Header>
        <Toast.Body>Your CSV file has been downloaded.</Toast.Body>
      </Toast>
    </Container>
  );
};

export default App;