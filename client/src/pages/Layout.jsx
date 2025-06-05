import React from 'react'
import { Outlet,Link } from 'react-router-dom';

function Layout() {
  return (
    <div>
    <header style={{ padding: 20, background: '#eee' }}>
      <nav>
        <Link to="/admin" style={{ margin: 10 }}>Admin</Link>
        <Link to="/student" style={{ margin: 10 }}>Student</Link>
        {/* <Link to="/staff" style={{ margin: 10 }}>Staff</Link> */}
      </nav>
    </header>
    <main style={{ padding: 20 }}>
      <Outlet /> {/* This is where child routes render */}
    </main>
  </div>
  )
}

export default Layout