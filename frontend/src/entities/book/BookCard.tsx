import React from 'react';
import { Card, Tag } from 'antd';
import type { Book as BookType } from '../../shared/types';

interface BookCardProps {
  book: BookType;
  onClick?: () => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onClick }) => {
  return (
    <Card
      hoverable
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <h3>{book.title}</h3>
      <p>ISBN: {book.isbn}</p>
      <p>Author: {book.author?.fullName || 'Unknown'}</p>
      <p>Publisher: {book.publisher}</p>
      <Tag color="blue">{book.year}</Tag>
    </Card>
  );
};
