import { Container, Title } from '@mantine/core';
import React from 'react';

import styles from './TemplatesPage.module.scss';

export const TemplatesPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <Container size="xl" className={styles.container}>
        <Title order={1} mb="lg" className={styles.title}>
          Шаблоны
        </Title>
      </Container>
    </div>
  );
};
