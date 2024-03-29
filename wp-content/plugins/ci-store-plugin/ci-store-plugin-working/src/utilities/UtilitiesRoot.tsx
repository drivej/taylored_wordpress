import * as React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

export const UtilitiesRoot = () => {
  const className = ({ isActive, isPending }) => (isActive ? 'btn btn-primary' : 'btn btn-light');
  return (
    <div className='p-3 d-flex flex-column gap-2'>
      <header>
        <p className='m-0'>CI Store</p>
        <h3>Utilities</h3>
      </header>
      <nav className='d-flex gap-1'>
        <NavLink to='/import' className={className}>
          Import
        </NavLink>
        <NavLink to='/products' className={className}>
          Products
        </NavLink>
        <NavLink to='/patch' className={className}>
          Patch
        </NavLink>
        <NavLink to='/monkeywrench' className={className}>
          Monkey Wrench
        </NavLink>
        <NavLink to='/logs' className={className}>
          Logs
        </NavLink>
        <NavLink to='/misc' className={className}>
          Misc
        </NavLink>
      </nav>
      <Outlet />
    </div>
  );
};
