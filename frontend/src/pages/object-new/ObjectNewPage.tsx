import { Container, Title, Text } from '@mantine/core';
import React from 'react';

import styles from './ObjectNewPage.module.scss';

export const ObjectNewPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <Container size="xl" className={styles.container}>
        <Title order={1} mb="lg" className={styles.title}>
          Создание объекта
        </Title>
        <Text className={styles.text}>Страница создания объекта в разработке...</Text>
      </Container>
    </div>
  );
};
