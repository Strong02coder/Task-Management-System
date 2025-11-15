import { useState } from 'react'
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa'

const Input = ({ value, onChange, label, placeholder, type }) => {

  const [showPassword, setShowPassword] = useState(false)

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  }
  return (
    <div className="flex flex-col">
      <label className="text-[13px] font-medium text-slate-800">{label}</label>
      <div className='input-box flex'>
        <input
          type={type === 'password' ? (showPassword ? 'text' : 'password') : type || 'text'}
          placeholder={placeholder}
          className='w-full bg-transparent outline-none'
          value={value}
          onChange={(e) => onChange(e)}
        />

        {type === 'password' && (
          <>
            {showPassword ? (
              <FaRegEye
                size = {22}
                className="text-blue-500 cursor-pointer"
                onClick={toggleShowPassword}
              />
            ) : (
              <FaRegEyeSlash
                size = {22}
                className="text-slate-400 cursor-pointer"
                onClick={toggleShowPassword}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Input