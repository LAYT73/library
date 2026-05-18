import React from 'react';
import { Card as AntCard } from 'antd';
import type { CardProps } from 'antd';

export const Card: React.FC<CardProps> = (props) => {
  return <AntCard {...props} />;
};
