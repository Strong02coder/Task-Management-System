import React from 'react'
import { useUserAuth } from '../../hooks/useUserAuth' // <-- This is the fix

const UserDashboard = () => {
  useUserAuth()  // Custom hook to handle user authentication
  return <div>UserDashboard</div>
}

export default UserDashboard