import * as React from 'react';
import { NavLink } from 'react-router-dom';

export const WesternNav = () => {
  return (
    <nav className='d-flex flex-wrap align-items-center gap-3 bg-white p-3 rounded'>
      <h3>Western</h3>
      <NavLink className='btn' to='/western/import'>
        Import
      </NavLink>
      <NavLink className='btn' to='/western/cleanup'>
        Clean Up
      </NavLink>
      <NavLink className='btn' to='/western/dif'>
        Dif
      </NavLink>
      <NavLink className='btn' to='/western/singleimport'>
        Single Import
      </NavLink>
      <NavLink className='btn' to='/western/synccategories'>
        Sync Categories
      </NavLink>
      <NavLink className='btn' to='/western/updateProductcategories'>
        Update Product Categories
      </NavLink>
      <NavLink className='btn' to='/western/bigimport'>
        Big Import
      </NavLink>
      {/* <NavLink className='btn' to='/western/delete'>
        Delete
      </NavLink> */}
      <NavLink className='btn' to='/western/products'>
        Products
      </NavLink>
      <NavLink className='btn' to='/western/api'>
        API
      </NavLink>
      {/* <NavLink className='btn' to='/western/cleanup'>
        Cleanup
      </NavLink> */}
      <a className='btn' target='westernapi' href='https://www.wps-inc.com/data-depot/v4/api/introduction'>
        API Docs
      </a>
    </nav>
  );
};
