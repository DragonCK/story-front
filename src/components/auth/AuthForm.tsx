import * as React from 'react';
import styled from 'styled-components';
import useInput from '~/libs/hooks/useInput';
import AuthEmailForm from './AuthEmailForm';
import palette from '~/libs/styles/palette';
import AuthSocialButtonGroup from './AuthSocialButtonGroup';
import AuthEmailSuccess from './AuthEmailSuccess';
import media from '~/libs/styles/media';

const AuthFormBlock = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  line-height: 1.5;
  .upper-wrapper {
    ${media.small} {
      margin-top: 2rem;
    }
  }
  h2,
  h4 {
    margin: 0;
  }
  h2 {
    font-size: 1.3125rem;
    color: ${palette.gray8};
  }
  h4 {
    margin-top: 1rem;
    margin-bottom: 1rem;
    color: ${palette.gray6};
  }
  section + section {
    margin-top: 2.5rem;
  }
  .foot {
    ${media.small} {
      margin-top: 2rem;
    }
    text-align: right;
    span {
      margin-right: 0.25rem;
    }
    .link {
      display: inline-block;
      font-weight: bold;
      color: ${palette.teal6};
      cursor: pointer;
      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

export interface AuthFormProps {
  loading: boolean;
  onSendAuthEmail: (email: string) => void;
  registered: boolean | null;
  currentPath: string;
}

const AuthForm: React.FC<AuthFormProps> = ({
  onSendAuthEmail,
  loading,
  registered,
  currentPath,
}) => {
  const [email, onChangeEmail] = useInput('');
  const onSubmit = (email: string) => {
    onSendAuthEmail(email);
  };

  return (
    <AuthFormBlock>
      <div className="upper-wrapper">
        <h2 data-testid="title">로그인</h2>
        <section>
          <h4>이메일로 인증하기</h4>
          {registered !== null ? (
            <AuthEmailSuccess registered={registered} />
          ) : (
            <AuthEmailForm
              value={email}
              onChange={onChangeEmail}
              onSubmit={onSubmit}
              disabled={loading}
            />
          )}
        </section>
        <section>
          <h4>소셜 계정으로 인증하기</h4>
          <AuthSocialButtonGroup currentPath={currentPath} />
        </section>
      </div>
    </AuthFormBlock>
  );
};

export default AuthForm;
