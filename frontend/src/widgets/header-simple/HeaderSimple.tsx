import { Burger, Container, Group, Menu, UnstyledButton, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuthStore } from '@app/store/StoreContext';
import { HEADER_LINKS, ROUTES } from '@shared/constants';
import { ThemeToggle } from '@shared/ui';

import classes from './HeaderSimple.module.scss';

export function HeaderSimple() {
  const [opened, { toggle }] = useDisclosure(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const items = HEADER_LINKS.map((link) => {
    const isActive = location.pathname.startsWith(link.link);
    return (
      <Link
        key={link.label}
        to={link.link}
        className={classes.link}
        data-active={isActive || undefined}
      >
        {link.label}
      </Link>
    );
  });

  return (
    <header className={classes.header}>
      <Container size="xl" className={classes.inner}>
        <Group gap="sm" visibleFrom="xs" style={{ marginLeft: 'auto' }}>
          {items}
          <ThemeToggle size="sm" radius="sm" />
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <UnstyledButton className={classes.userButton}>
                <Text size="sm" fw={500}>
                  {user?.login || user?.mail || 'example@mail.com'}
                </Text>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item onClick={handleLogout} className={classes.logoutMenuItem}>
                Выйти
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />
      </Container>
    </header>
  );
}
