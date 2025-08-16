import { Container, Title } from '@mantine/core';
import React from 'react';

import styles from './StoragePage.module.scss';

export const StoragePage: React.FC = () => {
  return (
    <div className={styles.page}>
      <Container size="xl" className={styles.container}>
        <Title order={1} mb="lg" className={styles.title}>
          Хранилища
        </Title>
      </Container>
    </div>
  );
};
