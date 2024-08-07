import * as React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

export const SupplierLinks = ({ tabs }: { tabs: { label: string; to: string }[] }) => {
  return (
    <div className='d-flex flex-column gap-3'>
      <nav className='d-flex gap-2 pb-3 border-bottom'>
        {tabs.map((tab) => (
          <NavLink className='btn btn-sm btn-primary' to={tab.to}>
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
};
