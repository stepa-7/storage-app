import { notifications } from '@mantine/notifications';
import { IconPlus } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import { useStorageStore } from '@app/store/StoreContext';
import { type StorageWithDetails } from '@shared/types';
import { Breadcrumbs, PageLayout } from '@shared/ui';
import { StorageTree, CreateStorageModal } from '@widgets/storage-tree';

export const StoragePage: React.FC = observer(() => {
  const { deleteStorage, getStorageById } = useStorageStore();
  const [addModalOpened, setAddModalOpened] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | undefined>();
  const { storageId } = useParams<{ storageId: string }>();

  const handleAddStorage = (parentId?: string) => {
    setSelectedParentId(parentId);
    setAddModalOpened(true);
  };

  const handleDeleteStorage = async (storage: StorageWithDetails) => {
    try {
      const success = await deleteStorage(storage.id);
      if (success) {
        notifications.show({
          title: 'Успех',
          message: 'Хранилище успешно удалено',
          color: 'green',
        });
      }
    } catch {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось удалить хранилище',
        color: 'red',
      });
    }
  };

  const handleCloseAddModal = () => {
    setAddModalOpened(false);
    setSelectedParentId(undefined);
  };

  return (
    <PageLayout
      title="Управление хранилищами"
      subtitle="Создавайте и управляйте структурой ваших хранилищ"
      action={{
        label: 'Хранилище',
        icon: <IconPlus size={16} />,
        onClick: () => handleAddStorage(),
      }}
    >
      {storageId && <Breadcrumbs storageId={storageId} />}
      <StorageTree onAddStorage={handleAddStorage} onDeleteStorage={handleDeleteStorage} />

      <CreateStorageModal
        opened={addModalOpened}
        onClose={handleCloseAddModal}
        parentStorage={selectedParentId ? getStorageById(selectedParentId) : null}
        onSuccess={() => {
          notifications.show({
            title: 'Успех',
            message: 'Хранилище успешно создано',
            color: 'green',
          });
        }}
      />
    </PageLayout>
  );
});
