import React from 'react'
import { Outlet } from 'react-router-dom'

const PrivateRoute = ({allowedRoles}) => {
  // pass allowedRoles to child routes via Outlet context to avoid unused variable warning
  return <Outlet context={{ allowedRoles }} />
}

export default PrivateRoute