import React from 'react';
import styled from 'styled-components';
import OutsideClickHandler from 'react-outside-click-handler';
import media from '~/libs/styles/media';
import HeaderUserMenuItem from './HeaderUserMenuItem';

const HeaderUserMenuBlock = styled.div`
  position: absolute;
  top: 100%;
  margin-top: 1rem;
  right: 0;
  > .menu-wrapper {
    position: relative;
    z-index: 5;
    width: 12rem;
    background: white;
    box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.1);
    .mobile-only {
      display: none;
      ${media.medium} {
        display: block;
      }
    }
  }
`;

interface HeaderUserMenuProps {
  onClose: () => void;
  onLogout: () => void;
  username: string;
  visible: boolean;
}
function HeaderUserMenu({
  onClose,
  onLogout,
  username,
  visible,
}: HeaderUserMenuProps) {
  if (!visible) return null;
  return (
    <OutsideClickHandler onOutsideClick={onClose}>
      <HeaderUserMenuBlock onClick={onClose}>
        <div className="menu-wrapper">
          <HeaderUserMenuItem to={`/@${username}`}>
            내 벨로그
          </HeaderUserMenuItem>
          <div className="mobile-only">
            <HeaderUserMenuItem to="/write">새 글 작성</HeaderUserMenuItem>
          </div>
          <HeaderUserMenuItem to="/saves">임시 글</HeaderUserMenuItem>
          <HeaderUserMenuItem to="/lists/liked">읽기 목록</HeaderUserMenuItem>
          <HeaderUserMenuItem to="/setting">설정</HeaderUserMenuItem>
          <HeaderUserMenuItem onClick={onLogout}>로그아웃</HeaderUserMenuItem>
        </div>
      </HeaderUserMenuBlock>
    </OutsideClickHandler>
  );
}

export default HeaderUserMenu;
