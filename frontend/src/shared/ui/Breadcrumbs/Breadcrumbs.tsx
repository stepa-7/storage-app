import { Breadcrumbs as MantineBreadcrumbs, Anchor, Text } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';

import { useStore } from '@app/store/StoreContext';
import { type Storage } from '@shared/types';

import s from './Breadcrumbs.module.scss';

interface BreadcrumbsProps {
  storageId: string;
}

export const Breadcrumbs = observer(({ storageId }: BreadcrumbsProps) => {
  const { storageStore } = useStore();
  const navigate = useNavigate();

  const storagePath = storageStore.getStoragePath(storageId);

  const handleStorageClick = (storageId: string) => {
    navigate(`/storage/${storageId}`);
  };

  if (storagePath.length === 0) {
    return null;
  }

  const breadcrumbItems = [
    <Anchor
      key="root"
      href="#"
      className={s.item}
      onClick={() => navigate('/storage')}
      style={{
        color: 'var(--mantine-color-text)',
        fontSize: 'var(--mantine-font-size-sm)',
        fontWeight: 400,
      }}
    >
      Все хранилища
    </Anchor>,

    ...storagePath.map((storage: Storage, index: number) => {
      const isLast = index === storagePath.length - 1;
      const ItemComponent = isLast ? 'span' : Anchor;

      return (
        <ItemComponent
          key={storage.id}
          component={isLast ? 'span' : 'button'}
          className={`${s.item} ${isLast ? s.current : ''}`}
          onClick={isLast ? undefined : () => handleStorageClick(storage.id)}
          style={{
            textDecoration: 'none',
            border: 'none',
            background: 'transparent',
            cursor: isLast ? 'default' : 'pointer',
            color: 'var(--mantine-color-text)',
            fontSize: 'var(--mantine-font-size-sm)',
            fontWeight: isLast ? 700 : 400,
          }}
        >
          <Text
            component="span"
            size="sm"
            style={{
              fontWeight: isLast ? 700 : 400,
              color: 'var(--mantine-color-text)',
            }}
          >
            {storage.name}
          </Text>
          {(storage.currentCapacity ?? storage.fullness ?? 0) > 0 && (
            <Text component="span" size="xs" className={s.itemCount}>
              ({storage.currentCapacity ?? storage.fullness}/
              {storage.maxCapacity ?? storage.capacity})
            </Text>
          )}
        </ItemComponent>
      );
    }),
  ];

  return (
    <nav className={s.breadcrumbs} aria-label="Навигация по хранилищам">
      <MantineBreadcrumbs separator={<span className={s.separator}>/</span>}>
        {breadcrumbItems}
      </MantineBreadcrumbs>
    </nav>
  );
});
