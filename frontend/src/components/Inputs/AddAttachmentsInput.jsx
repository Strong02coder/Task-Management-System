import React, { useState } from 'react';
import { HiMiniPlus, HiOutlineTrash } from 'react-icons/hi2';
import { LuPaperclip } from 'react-icons/lu';

const AddAttachmentsInput = ({ attachments, setAttachments }) => {
  const [option, setOption] = useState('');

  // Function to handle adding an option
  const handleAddOption = () => {
    if (option.trim()) {
      setAttachments([...attachments, option.trim()]);
      setOption('');
    }
  };

  // Function to handle removing an option
  const handleRemoveOption = (index) => {
    const updatedArr = attachments.filter((_, idx) => idx !== index);
    setAttachments(updatedArr);
  };

  return (
    <div>
      {attachments.map((item, index) => (
        <div
          key={index} // Use index as key if items are not unique, though item itself might be better if they are
          className='flex justify-between bg-gray-50 border border-gray-100 px-3 py-2 rounded-md mb-3 mt-2'
        >
          <div className='flex-1 flex items-center gap-3'> {/* Removed redundant border */}
            <LuPaperclip className='text-gray-400' />
            <p className='text-xs text-black'>{item}</p>
          </div>

          <button
            className='cursor-pointer'
            onClick={() => handleRemoveOption(index)}
          >
            <HiOutlineTrash className='text-lg text-red-500' />
          </button>
        </div>
      ))}

      <div className='flex items-center gap-5 mt-4'>
        <div className='flex-1 flex items-center gap-3 border border-gray-100 rounded-md px-3'>
          <LuPaperclip className='text-gray-400' />

          <input
            type="text"
            placeholder='Enter Attachment URL'
            className='w-full text-[13px] text-black outline-none bg-white py-2'
            value={option}
            onChange={(e) => setOption(e.target.value)}
          />
        </div>

        <button className='card-btn text-nowrap' onClick={handleAddOption}>
          <HiMiniPlus className='text-lg' />
          Add
        </button>
      </div>
    </div>
  );
};

export default AddAttachmentsInput;
