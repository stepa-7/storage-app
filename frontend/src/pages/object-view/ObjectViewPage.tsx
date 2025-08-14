import { Container, Title, Text } from '@mantine/core';
import React from 'react';

import styles from './ObjectViewPage.module.scss';

export const ObjectViewPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <Container size="xl" className={styles.container}>
        <Title order={1} mb="lg" className={styles.title}>
          Просмотр объекта
        </Title>
        <Text className={styles.text}>Страница просмотра объекта в разработке...</Text>
      </Container>
    </div>
  );
};
