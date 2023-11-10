import * as React from 'react';
import { createRoot } from 'react-dom/client';
import './assets/styles.scss';
import { WordPressApp } from './wordpress/WordpressApp';

// const root = createRoot(document.getElementById('product-root'));
// root.render(<WordPressApp />);

export const render = (id: string) => {
  const root = createRoot(document.getElementById(id));
  root.render(<WordPressApp />);
};
