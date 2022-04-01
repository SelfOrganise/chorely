import React, { ForwardedRef } from 'react';
import classNames from 'classnames';

const defaultClassNames =
  'shadow border py-3 px-3 mb-4 text-gray-700  rounded focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 focus:outline-none';

export const TextField = React.forwardRef(
  (
    {
      className,
      children,
      ...rest
    }: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
    ref: ForwardedRef<HTMLInputElement>
  ) => (
    <input type="text" ref={ref} className={classNames(defaultClassNames, className)} {...rest}>
      {children}
    </input>
  )
);
