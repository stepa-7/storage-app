import { Burger, Container, Group, Menu, UnstyledButton, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuthStore } from '@app/store/StoreContext';
import { ROUTES } from '@shared/constants';
import { ThemeToggle } from '@shared/ui';

import classes from './HeaderSimple.module.scss';

const links = [
  { link: ROUTES.STORAGE, label: 'Хранилища' },
  { link: ROUTES.TEMPLATES, label: 'Шаблоны' },
];

export function HeaderSimple() {
  const [opened, { toggle }] = useDisclosure(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const items = links.map((link) => {
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
      {/* SVG фильтр для имитации жидкого стекла */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
        <defs>
          <filter id="header-glass-distortion">
            <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="5"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <Container size="md" className={classes.inner}>
        {/* Логотип убран для упрощения дизайна */}

        <Group gap="sm" visibleFrom="xs" style={{ marginLeft: 'auto' }}>
          {items}
          <ThemeToggle className={classes.themeToggle} size="sm" radius="sm" />
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
