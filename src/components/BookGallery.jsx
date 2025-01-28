import React, { useState } from 'react';
import { Card, Row, Col, Image } from 'react-bootstrap';
import { ChevronDown } from 'react-bootstrap-icons'; // Import chevron icon
import './BookGallery.css'; // Import the CSS file

const BookGallery = ({ books }) => {
  const [expandedCards, setExpandedCards] = useState([]);

  // Toggle expand/collapse for a card
  const toggleExpand = (index) => {
    if (expandedCards.includes(index)) {
      setExpandedCards(expandedCards.filter((i) => i !== index));
    } else {
      setExpandedCards([...expandedCards, index]);
    }
  };

  return (
    <Row className="g-4">
      {books.map((book, index) => (
        <Col key={index} md={4}>
          <Card className="book-card" onClick={() => toggleExpand(index)}>
            <Image src={book.coverImage} alt="Book Cover" className="book-cover" />
            <Card.Body>
              <Card.Title>{book.title}</Card.Title>
              <Card.Text className="text-muted">{book.author}</Card.Text>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-primary">Click to {expandedCards.includes(index) ? 'collapse' : 'expand'}</span>
                <span className={`chevron-icon ${expandedCards.includes(index) ? 'rotate-up' : ''}`}>
                  <ChevronDown className="text-primary" />
                </span>
              </div>
            </Card.Body>

            {/* Expanded content */}
            {expandedCards.includes(index) && (
              <div className="expanded-content">
                <p><strong>Likes:</strong> {book.likes}</p>
                <p><strong>Reviews:</strong></p>
                <ul className="reviews-list">
                  {book.reviews.map((review, i) => (
                    <li key={i}>
                      "{review.text}" - <em>{review.author}</em>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default BookGallery;