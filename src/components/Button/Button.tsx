import { ButtonHTMLAttributes } from 'react';
import { StyledButtonFrame, StyledInnerWrapper, StyledLink } from './styled';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  to?: string;
  href?: string;
}

export function Button({ children, to, href, ...props }: ButtonProps) {
  /**  */
  if (href) {
    return (
      <StyledButtonFrame as="a" href={href}>
        <StyledInnerWrapper>{children}</StyledInnerWrapper>
      </StyledButtonFrame>
    );
  }

  /** Internal React Router links */
  if (to) {
    return (
      <StyledLink to={to}>
        <StyledButtonFrame>
          <StyledInnerWrapper>{children}</StyledInnerWrapper>
        </StyledButtonFrame>
      </StyledLink>
    );
  }

  /** Default button */
  return (
    <StyledButtonFrame as="button" {...props}>
      <StyledInnerWrapper>{children}</StyledInnerWrapper>
    </StyledButtonFrame>
  );
}
