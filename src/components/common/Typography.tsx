import React from 'react';
import styled from 'styled-components';
import media from '~/libs/styles/media';
import palette from '~/libs/styles/palette';

const TypographyBlock = styled.div`
  font-size: 1.125rem;
  color: ${palette.gray8};
  line-height: 1.85;
  letter-spacing: -0.02em;
  word-break: keep-all;
  word-wrap: break-word;
  p {
    b {
      font-weight: 400;
    }
    code {
      background: #e3fff6;
      padding-left: 0.25em;
      padding-right: 0.25em;
    }
    a {
      code {
        color: ${palette.teal6};
      }
    }
  }

  a {
    color: ${palette.teal7};
    text-decoration: none;
    &:hover {
      color: ${palette.teal6};
      text-decoration: underline;
    }
  }
  code {
    font-family: 'Fira Mono', source-code-pro, Menlo, Monaco, Consolas,
      'Courier New', monospace;
  }
  hr {
    border: none;
    height: 1px;
    width: 100%;
    background: #dedede;
    margin-top: 2rem;
    margin-bottom: 2rem;
  }
  p {
    img {
      display: block;
      margin: 0 auto;
      max-width: 100%;
      margin-top: 3rem;
      margin-bottom: 3rem;
    }
  }
  h1 {
    font-size: 2.5rem;
  }
  h2 {
    font-size: 2rem;
  }
  h3 {
    font-size: 1.5rem;
  }
  h4 {
    font-size: 1.125rem;
  }
  h1,
  h2,
  h3,
  h4 {
    line-height: 1.5;
    margin-bottom: 1rem;
  }
  p + h1,
  p + h2,
  p + h3,
  p + h4 {
    margin-top: 2.5rem;
  }
  ${media.small} {
    font-size: 1rem;
    h1 {
      font-size: 2.25rem;
    }
    h2 {
      font-size: 1.75rem;
    }
    h3 {
      font-size: 1.25rem;
    }
    h4 {
      font-size: 1rem;
    }
    h1,
    h2,
    h3,
    h4 {
      margin-bottom: 0.75rem;
    }
    p + h1,
    p + h2,
    p + h3,
    p + h4 {
      margin-top: 2rem;
    }
  }
  blockquote {
    margin-top: 2rem;
    margin-bottom: 2rem;
    border-left: 4px solid ${palette.teal5};
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    background: ${palette.gray0};
    margin-left: 0;
    margin-right: 0;
    padding: 1rem;
    padding-left: 2rem;
    color: ${palette.gray9};
    ul,
    ol {
      padding-left: 1rem;
    }
    *:first-child {
      margin-top: 0;
    }
    *:last-child {
      margin-bottom: 0;
    }
  }
`;

export interface TypographyProps {}

const Typography: React.FC<TypographyProps> = ({ children }) => {
  return <TypographyBlock>{children}</TypographyBlock>;
};

export default Typography;
