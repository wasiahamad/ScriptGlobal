import { Link } from 'react-router-dom';

interface ButtonLinkProps {
  to: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  external?: boolean;
}

export function ButtonLink({
  to,
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  external = false,
}: ButtonLinkProps) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2';

  const variants = {
    primary: 'bg-navy-800 text-white hover:bg-navy-900 shadow-md hover:shadow-lg',
    secondary: 'bg-teal-600 text-white hover:bg-teal-700 shadow-md hover:shadow-lg',
    outline: 'border-2 border-navy-700 text-navy-800 hover:bg-navy-800 hover:text-white',
    ghost: 'text-navy-700 hover:bg-navy-100',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if (external) {
    return (
      <a href={to} className={classes} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <Link to={to} className={classes}>
      {children}
    </Link>
  );
}

interface ButtonProps {
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export function Button({
  onClick,
  type = 'button',
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-navy-800 text-white hover:bg-navy-900 shadow-md hover:shadow-lg',
    secondary: 'bg-teal-600 text-white hover:bg-teal-700 shadow-md hover:shadow-lg',
    outline: 'border-2 border-navy-700 text-navy-800 hover:bg-navy-800 hover:text-white',
    ghost: 'text-navy-700 hover:bg-navy-100',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}
