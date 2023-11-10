import * as React from 'react';
import { MessageProvider } from './Message';
import { Nav } from './Nav';

export const Layout = ({ children }: { children: React.ReactNode; }) => {
  return (
    <>
      <MessageProvider>
        <Nav />
        <main className='d-flex flex-column gap-3'>{children}</main>
        <footer>&copy;{new Date().getFullYear()} Contento Interactive</footer>
      </MessageProvider>
    </>
  );
};
