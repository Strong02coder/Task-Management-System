import React from 'react'
import AuthImage from '../../assets/Images/auth-image.jpeg'

const AuthLayout = ({ children }) => {
  return <div className = "flex">
    <div className="w-screen h-screen md:w-[60vw] px-12 pt-8 pb-12">
      <h2 className="text-lg font-bold text-black">Task Management System</h2>
      {children}
    </div>

    <div>
      <img
        src={AuthImage}
        alt="Auth Background"
        className="hidden md:block md:w-[60vw] h-screen object-cover"
      />
    </div>
  </div>
}

export default AuthLayout;
