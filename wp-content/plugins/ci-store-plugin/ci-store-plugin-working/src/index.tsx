import * as React from 'react';
import { createRoot } from 'react-dom/client';
import './assets/styles.scss';
import { App } from './components/App';

const root = createRoot(document.getElementById('root'));
root.render(<App />);