import React, { memo } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = memo(({ children, ...props }) => {
  return <button {...props}>{children}</button>;
});

Button.displayName = 'Button';
