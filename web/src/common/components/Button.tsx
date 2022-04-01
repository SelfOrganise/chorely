import React, { ForwardedRef } from 'react';
import classNames from 'classnames';

const defaultClassNames = 'bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 disabled:bg-gray-400 rounded';

export const Button = React.forwardRef(
  (
    {
      className,
      children,
      ...rest
    }: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>,
    ref: ForwardedRef<HTMLButtonElement>
  ) => (
    <button ref={ref} className={classNames(defaultClassNames, className)} {...rest}>
      {children}
    </button>
  )
);
