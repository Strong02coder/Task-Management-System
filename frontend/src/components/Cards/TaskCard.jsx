import React from 'react'
import Progress from '../layouts/Progress';
import AvatarGroup from '../Tables/AvatarGroup';
import moment from 'moment';
import { LuPaperclip } from 'react-icons/lu';

const TaskCard = ( {title, description, priority, status, progress, createdAt, dueDate, assignedTo, attachmentCount, completedTodoCount, todoChecklist, onClick} ) => {

  const getStatusTagColor = () => {
    switch (status) {
      case 'In Progress':
        return 'text-cyan-500 bg-cyan-50 border border-cyan-500/10';

      case 'Completed':
        return 'text-lime-500 bg-lime-50 border border-lime-500/10';
      
      default:
        return 'text-violet-500 bg-violet-50 border border-violet-500/10';  
    }
  };

  const getPriorityTagColor = () => {
    switch (priority) {
      case 'Low':
        return 'text-emerald-500 bg-emerald-50 border border-emerald-500/10';

      case 'Medium':
        return 'text-amber-500 bg-amber-50 border border-amber-500/10';

      default:
        return 'text-red-500 bg-red-50 border border-red-500/10';
    }
  };  


  return (
    <div
      className='bg-white rounded-lg p-4 space-y-4 cursor-pointer hover:shadow-lg transition-shadow duration-300'
      onClick={onClick}
    >
      <div className='flex items-center justify-between'>
        <div
          className={`text-[11px] font-medium ${getStatusTagColor()} px-4 py-0.5 rounded`}
        >
          {status}
        </div>
        <div
          className={`text-[11px] font-medium ${getPriorityTagColor()} px-4 py-0.5 rounded`}
        >
          {priority} Priority
        </div>
      </div>
      <div
        className={`px-4 border-l-[3px] space-y-2 ${
          status === 'In Progress'
            ? 'border-cyan-500'
            : status === 'Completed'
            ? 'border-lime-500'
            : 'border-violet-500'
        }`}
      >
        <p className='text-sm font-semibold text-gray-800'>{title}</p>
        <p className='text-xs text-gray-500 line-clamp-2'>{description}</p>
        <p className='text-xs text-gray-600'>
          Task Done:{' '}
          <span className='font-medium text-gray-800'>
            {completedTodoCount}/{todoChecklist.length || 0}
          </span>
        </p>
        <Progress progress={progress} status={status} />
      </div>
      <div className='flex items-center justify-between text-xs text-gray-500'>
        <div className='flex items-center gap-4'>
          <div>
            <label className='font-medium'>Start Date</label>
            <p className='text-gray-700'>
              {moment(createdAt).format('MMM DD, YYYY')}
            </p>
          </div>

          <div>
            <label className='font-medium'>Due Date</label>
            <p className='text-gray-700'>
              {moment(dueDate).format('MMM DD, YYYY')}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-4'>
          <AvatarGroup assignedTo={assignedTo || []} />

          {attachmentCount > 0 && (
            <div className='flex items-center gap-1'>
              <LuPaperclip className='text-gray-600' />{' '}
              <span className='font-medium text-gray-800'>
                {attachmentCount}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskCard;
