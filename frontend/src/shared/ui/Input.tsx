import React from 'react';
import { Input as AntInput } from 'antd';
import type { InputProps } from 'antd';

export const Input: React.FC<InputProps> = (props) => {
  return <AntInput {...props} />;
};

export const PasswordInput: React.FC<InputProps> = (props) => {
  return <AntInput.Password {...props} />;
};
