import React, { useState } from 'react';
import { Table, Image } from 'react-bootstrap';
import { ChevronDown } from 'react-bootstrap-icons'; // Import chevron icon
import './BookTable.css'; // Import the CSS file

const BookTable = ({ books }) => {
  const [expandedRows, setExpandedRows] = useState([]);

  // Toggle expand/collapse for a row
  const toggleExpand = (index) => {
    if (expandedRows.includes(index)) {
      setExpandedRows(expandedRows.filter((i) => i !== index));
    } else {
      setExpandedRows([...expandedRows, index]);
    }
  };

  return (
    <Table striped bordered hover responsive className="mt-4">
      <thead>
        <tr>
          <th>#</th>
          <th>ISBN</th>
          <th>Title</th>
          <th>Author</th>
          <th>Publisher</th>
          <th></th> {/* Empty header for the chevron icon */}
        </tr>
      </thead>
      <tbody>
        {books.map((book, index) => (
          <React.Fragment key={index}>
            {/* Clickable row */}
            <tr onClick={() => toggleExpand(index)}>
              <td>{index + 1}</td>
              <td>{book.isbn}</td>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.publisher}</td>
              <td>
                <span className={`chevron-icon ${expandedRows.includes(index) ? 'rotate-up' : ''}`}>
                  <ChevronDown className="text-primary" />
                </span>
              </td>
            </tr>

            {/* Expanded row */}
            {expandedRows.includes(index) && (
              <tr className="expanded-row">
                <td colSpan="6">
                  <div className="p-3">
                    <Image
                      src={book.coverImage}
                      alt="Book Cover"
                      thumbnail
                      className="book-cover"
                    />
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
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </Table>
  );
};

export default BookTable;