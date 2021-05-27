import React from 'react';
import { Menu, Container, Icon } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import Link from 'next/link';

function Navbar() {
  const router = useRouter();
  return (
    <Menu fluid borderless>
      <Container text>
        <Link href='/login'>
          <Menu.Item header active={true}>
            <Icon size='large' name='sign in' />
            Login
          </Menu.Item>
        </Link>

        <Link href='/signup'>
          <Menu.Item header active={true}>
            <Icon size='large' name='signup' />
            Signup
          </Menu.Item>
        </Link>
      </Container>
    </Menu>
  );
}

export default Navbar;
