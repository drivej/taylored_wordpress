import * as React from 'react';
import { NavLink } from 'react-router-dom';

export const WooNav = () => {
  return (
    <nav className='d-flex align-items-center gap-3 bg-white p-3 rounded'>
      <h3>Woo</h3>
      <NavLink className='btn' to='/woo/products'>
        Products
      </NavLink>
      <a className='btn' target='wpadmin' href='https://tayloredblank4dev.kinsta.cloud/wp-admin/'>
        Admin
      </a>
      <a className='btn' target='wooapi' href='https://woocommerce.github.io/woocommerce-rest-api-docs/'>
        API Docs
      </a>
    </nav>
  );
};
