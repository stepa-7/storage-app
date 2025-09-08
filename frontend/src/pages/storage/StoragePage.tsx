import { notifications } from '@mantine/notifications';
import { IconPlus } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import { useStorageStore } from '@app/store/StoreContext';
import { type StorageWithDetails } from '@shared/types';
import { Breadcrumbs, PageLayout, DeleteConfirmationModal, EditStorageModal } from '@shared/ui';
import { StorageTree, CreateStorageModal } from '@widgets/storage-tree';

export const StoragePage: React.FC = observer(() => {
  const { deleteStorage, getStorageById } = useStorageStore();
  const [addModalOpened, setAddModalOpened] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | undefined>();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [storageToDelete, setStorageToDelete] = useState<StorageWithDetails | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [storageToEdit, setStorageToEdit] = useState<StorageWithDetails | null>(null);
  const { storageId } = useParams<{ storageId: string }>();

  const handleAddStorage = (parentId?: string) => {
    setSelectedParentId(parentId);
    setAddModalOpened(true);
  };

  const handleDeleteStorage = (storage: StorageWithDetails) => {
    setStorageToDelete(storage);
    setShowDeleteModal(true);
  };

  const handleEditStorage = (storage: StorageWithDetails) => {
    setStorageToEdit(storage);
    setShowEditModal(true);
  };

  const confirmDeleteStorage = async () => {
    if (!storageToDelete) return;

    try {
      const success = await deleteStorage(storageToDelete.id);
      if (success) {
        notifications.show({
          title: 'Успех',
          message: 'Хранилище успешно удалено',
          color: 'green',
        });
        setShowDeleteModal(false);
        setStorageToDelete(null);
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

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setStorageToEdit(null);
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
      <StorageTree
        onAddStorage={handleAddStorage}
        onDeleteStorage={handleDeleteStorage}
        onEditStorage={handleEditStorage}
      />

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

      <DeleteConfirmationModal
        opened={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteStorage}
        title="Удаление хранилища"
        itemName={storageToDelete?.name || ''}
        description="Это действие нельзя отменить. Хранилище будет полностью удалено."
      />

      <EditStorageModal
        opened={showEditModal}
        onClose={handleCloseEditModal}
        storage={storageToEdit}
        onSuccess={(updatedStorage) => {
          notifications.show({
            title: 'Успех',
            message: `Хранилище "${updatedStorage.name}" успешно обновлено`,
            color: 'green',
          });
        }}
      />
    </PageLayout>
  );
});
