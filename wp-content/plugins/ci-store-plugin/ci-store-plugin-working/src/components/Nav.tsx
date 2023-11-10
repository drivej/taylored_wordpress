import * as React from 'react';
import { NavLink } from 'react-router-dom';

export const Nav = () => {
  return (
    <nav className='shadow navbar d-flex bg-light' style={{ justifyContent: 'start', gap: 10 }}>
      <h3 title='Contento Interactive' className='p-3 m-0'>
        CI
      </h3>
      <NavLink className='nav-link p-3' to='/'>
        Upload
      </NavLink>
      <NavLink className='nav-link p-3' to='/store'>
        Store
      </NavLink>
      <NavLink className='nav-link p-3' to='/western'>
        Western
      </NavLink>
      <NavLink className='nav-link p-3' to='/woo/products'>
        Woo Products
      </NavLink>
      <a href='https://my.kinsta.com/sites/details/20c55f4f-dbee-47e7-869f-c373b56e867e/a54ef749-2476-4451-8d27-687a4092d195?idCompany=1d7d19f0-7059-4d39-8105-0c19df98e7a4' target='kinsta'>
        Kinsta
      </a>
    </nav>
  );
};
