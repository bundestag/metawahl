// @flow

import React from 'react';

import { Container, Dropdown, Menu, Responsive } from 'semantic-ui-react'
import { Link } from 'react-router-dom';
import Search from './Search';

const HeaderMenu = (context: {}) => (
  <div>
    <Responsive minWidth={600}>
      <Menu>
        <Container>
          <Menu.Item as={Link} to="/" header>
            Metawahl
          </Menu.Item>
          <Menu.Item as={Link} to='/'>Wahlen</Menu.Item>
          <Menu.Item as={Link} to='/bereiche/'>Bereiche</Menu.Item>
          <Menu.Item as={Link} to='/themen/'>Themen</Menu.Item>

            <Search {...context} large className="small right aligned item" />

        </Container>
      </Menu>
    </Responsive>
    <Responsive maxWidth={600}>
      <Menu fluid>
        <Dropdown item text='Metawahl'>
          <Dropdown.Menu fluid>
            <Dropdown.Item as={Link} to="/">Wahlen</Dropdown.Item>
            <Dropdown.Item as={Link} to="/bereiche/">Bereiche</Dropdown.Item>
            <Dropdown.Item as={Link} to="/themen/">Themen</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Search {...context} large className="small right aligned item" />
      </Menu>
    </Responsive>
  </div>
);

export default HeaderMenu;
