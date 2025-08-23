import { Group, NavLink, ScrollArea, ActionIcon, Text } from '@mantine/core';
import {
  IconChevronLeft,
  IconChevronRight,
  IconLogout,
  type Icon as TablerIcon,
  IconLayoutGridAdd,
  IconLayoutGrid,
  IconBox,
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuthStore, useStorageStore } from '@app/store/StoreContext';
import Logo from '@shared/assets/icons/logo/logo.svg?react';
import LogoText from '@shared/assets/icons/logo_text/logo_text.svg?react';
import { ROUTES } from '@shared/constants';
import type { Storage as StorageType } from '@shared/types';

import { useNavbar } from './NavbarContext';
import classes from './TreeNavbar.module.scss';

/** ---------- Типы данных ---------- */
type NavItem = {
  id?: string;
  label: string;
  icon?: TablerIcon;
  to?: string;
  defaultOpened?: boolean;
  children?: NavItem[];
};

const buildStorageTree = (storages: StorageType[], parentId?: string | null): NavItem[] => {
  const children = storages.filter((s) => s.parentId === parentId);

  return children.map((storage) => {
    const hasChildren = storages.some((s) => s.parentId === storage.id);

    return {
      id: storage.id,
      label: storage.name,
      icon: hasChildren ? IconLayoutGridAdd : IconLayoutGrid,
      to: ROUTES.STORAGE_VIEW.replace(':id', storage.id),
      children: hasChildren ? buildStorageTree(storages, storage.id) : undefined,
      defaultOpened: hasChildren ? false : undefined,
    };
  });
};

function TreeNavItem({ item, isCollapsed }: { item: NavItem; isCollapsed: boolean }) {
  const LeftIcon = item.icon;
  const navigate = useNavigate();
  const [opened, setOpened] = useState(item.defaultOpened || false);

  const handleClick = (e: React.MouseEvent) => {
    if (item.to) {
      e.preventDefault();
      navigate(item.to);
      if (item.children && item.children.length > 0) {
        setOpened(!opened);
      }
    }
  };

  if (isCollapsed) {
    return item.to ? (
      <NavLink
        href={item.to}
        onClick={handleClick}
        label=""
        leftSection={LeftIcon ? <LeftIcon size={20} /> : undefined}
        className={classes.collapsedItem}
      />
    ) : null;
  }

  return (
    <NavLink
      href={item.to}
      onClick={handleClick}
      label={item.label}
      leftSection={LeftIcon ? <LeftIcon size={18} /> : undefined}
      opened={opened}
      onChange={setOpened}
    >
      {item.children &&
        item.children.length > 0 &&
        opened &&
        item.children.map((child) => (
          <TreeNavItem key={child.id ?? child.label} item={child} isCollapsed={isCollapsed} />
        ))}
    </NavLink>
  );
}

/** ---------- Navbar с Tree View ---------- */
export function TreeNavbar() {
  const { isCollapsed, toggleCollapse } = useNavbar();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { storages, loadAllStorages } = useStorageStore();

  useEffect(() => {
    loadAllStorages();
  }, [loadAllStorages]);

  const treeData = buildStorageTree(storages, null);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <nav className={`${classes.navbar} ${isCollapsed ? classes.collapsed : ''}`}>
      <div className={classes.header}>
        <Group justify="space-between" align="center">
          <Group gap="xs" align="center">
            <div className={classes.logoContainer}>
              <Logo style={{ width: 32, height: 32 }} />
            </div>
            {!isCollapsed && (
              <div className={classes.logoTextContainer}>
                <LogoText style={{ width: 96 }} />
              </div>
            )}
          </Group>
          <ActionIcon
            variant="subtle"
            onClick={toggleCollapse}
            className={classes.toggleButton}
            aria-label={isCollapsed ? 'Развернуть навигацию' : 'Свернуть навигацию'}
            size="md"
          >
            {isCollapsed ? <IconChevronRight size={18} /> : <IconChevronLeft size={18} />}
          </ActionIcon>
        </Group>
      </div>

      {!isCollapsed && (
        <ScrollArea className={classes.links}>
          <div className={classes.linksInner}>
            <div className={classes.sectionTitle}>Хранилища</div>
            {treeData.length > 0 ? (
              treeData.map((item) => (
                <TreeNavItem key={item.id ?? item.label} item={item} isCollapsed={isCollapsed} />
              ))
            ) : (
              <div className={classes.emptyState}>
                <div className={classes.emptyStateIcon}>
                  <IconBox />
                </div>
                <Text c="dimmed">Нет хранилищ</Text>
              </div>
            )}
          </div>
        </ScrollArea>
      )}

      {isCollapsed && (
        <div className={classes.collapsedLinks}>
          {treeData.map((item) => (
            <TreeNavItem key={item.id ?? item.label} item={item} isCollapsed={isCollapsed} />
          ))}
        </div>
      )}

      <div className={classes.footer}>
        <a href="#" className={classes.link} onClick={handleLogout}>
          <IconLogout className={classes.linkIcon} stroke={1.5} />
          {!isCollapsed && <span>Выйти</span>}
        </a>
      </div>
    </nav>
  );
}
