import React from 'react'

const AvatarGroup = ({ avatars, maxVisible = 4 }) => {
  return (
    <div className='flex items-center gap-2'>
      {avatars.slice(0, maxVisible).map((avatar, index) => (
        <img 
          key={index} 
          src={avatar || null} 
          alt={`User Avatar ${index}`} 
          className='w-10 h-10 rounded-full border-white -ml-3 first:ml-0' 
        />
      ))}
      {avatars.length > maxVisible && (
        <div className='w-10 h-10 flex items-center justify-center bg-blue-50 text-sm font-medium rounded-full border-2 border-white -ml-3'>+{avatars.length - maxVisible}</div>
      )}
    </div>
  )
}

export default AvatarGroup;