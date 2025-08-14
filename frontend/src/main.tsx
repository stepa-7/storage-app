import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './app/App';

import '@shared/styles/theme.scss';
import '@shared/styles/fonts.scss';
import '@shared/styles/typography.scss';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
