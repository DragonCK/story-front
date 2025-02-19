import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useTransition, animated } from 'react-spring';
import OutsideClickHandler from 'react-outside-click-handler';
import palette from '~/libs/styles/palette';

export type MainMobileHeadExtraProps = {
  visible: boolean;
  onClose: (e: React.MouseEvent<HTMLElement>) => void;
};

function MainMobileHeadExtra({ visible, onClose }: MainMobileHeadExtraProps) {
  const transition = useTransition(visible, null, {
    from: {
      opacity: 0,
      transform: 'scale(0.8)',
    },
    enter: {
      opacity: 1,
      transform: 'scale(1)',
    },
    leave: {
      opacity: 0,
      transform: 'scale(0.8)',
    },
    config: {
      tension: 350,
      friction: 26,
    },
  });

  return (
    <>
      {transition.map(({ item, key, props }) =>
        item ? (
          <Aligner key={key}>
            <OutsideClickHandler onOutsideClick={onClose} key={key}>
              <Block style={props}>
                <ul>
                  <li>
                    <Link href="/@velog">
                      <a>공지사항</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/tags">
                      <a>태그 목록</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/policy/terms">
                      <a> 서비스 정책</a>
                    </Link>
                  </li>
                  <li>
                    <a
                      href="https://bit.ly/velog-slack"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Slack
                    </a>
                  </li>
                </ul>
                <div className="contact">
                  <h5>문의</h5>
                  <div className="email">contact@velog.io</div>
                </div>
              </Block>
            </OutsideClickHandler>
          </Aligner>
        ) : null
      )}
    </>
  );
}

const Aligner = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 5;
`;
const Block = styled(animated.div)`
  margin-top: 0.5rem;
  width: 12rem;
  box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.1);
  background: white;
  color: ${palette.gray9};
  transform-origin: top right;
  ul {
    list-style: none;
    padding-left: 0;
    margin: 0;
  }
  li {
    font-weight: 600;
    font-size: 0.875rem;
    padding: 0.75rem 1rem;
    a {
      color: inherit;
      text-decoration: none;
    }
  }
  li + li {
    border-top: 1px solid ${palette.gray1};
  }
  .contact {
    border-top: 1px solid #f1f3f5;
    padding: 1rem;
    h5 {
      margin: 0;
      font-size: 0.75rem;
    }
    .email {
      color: ${palette.gray8};
      font-size: 0.75rem;
    }
  }
`;

export default MainMobileHeadExtra;
