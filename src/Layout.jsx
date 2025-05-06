import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './component/Navbar.jsx'
import Footer from './component/Footer.jsx'

const Layout = () => {
  return (
    <>
    <Navbar/>
    <Outlet/>
    <Footer/>
    </>
  )
}

export default Layout