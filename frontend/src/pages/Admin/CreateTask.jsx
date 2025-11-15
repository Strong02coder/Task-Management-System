import React, { useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { PRIORITY_DATA } from '../../utils/data';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import moment from 'moment';
import { LuTrash2 } from 'react-icons/lu';
import SelectDropdown from '../../components/Inputs/SelectDropdown';
import SelectUsers from '../../components/Inputs/SelectUsers';
import TodoListInput from '../../components/Inputs/TodoListInput';
import AddAttachmentsInput from '../../components/Inputs/AddAttachmentsInput.jsx';

const CreateTask = () => {
  const location = useLocation();
  const { taskId } = location.state || {};
  const navigate = useNavigate();

  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    priority: 'Low',
    dueDate: '',
    assignedTo: [], 
    todoCheckList: [],
    attachments: [],
  });

  const [currentTask, setCurrentTask] = useState(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);

  const handleValueChange = (key, value) => {
    setTaskData((prevData) => ({ ...prevData, [key]: value }));
  };

  const clearData = () => {
    // Reset Form Data
    setTaskData({
      title: '',
      description: '',
      priority: 'Low',
      dueDate: '', 
      assignedTo: [], 
      todoCheckList: [],
      attachments: [],
    });
  };

  // Create Task
  const createTask = async () => {
    setLoading(true);

    try {
      const todoList = taskData.todoCheckList.map((item) => ({
        text: item.text,
        completed: false,
      }));

      // FIX 4: Create a safe payload to send
      const payload = {
        ...taskData,
        todoCheckList: todoList,
        status: 'Pending', // Add the required 'status' field
        
        // Safely handle the date
        dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null,
      };

      // Don't send a null date if it's not set
      if (payload.dueDate === null) {
        delete payload.dueDate;
      }
      
      const response = await axiosInstance.post(
        API_PATHS.TASKS.CREATE_TASK,
        payload // Send the safe payload
      );

      toast.success('Task created successfully');
      clearData();

    } catch (error) {
      console.error('Error creating task:', error);
      toast.error("Failed to create task. Please check the console.");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Update Task
  const updateTask = async () => {};

  const handleSubmit = async () => {
    setError('');

    // Input Validations
    if (!taskData.title.trim()) {
      setError('Task Title is required');
      return;
    }

    if (!taskData.description.trim()) {
      setError('Task Description is required');
      return;
    }

    // This check is fine, as '' is falsy
    if (!taskData.dueDate) {
      setError('Please select a due date for the task');
      return;
    }

    // FIX 5: This validation logic is now correct because assignedTo is an array
    if (taskData.assignedTo.length === 0) {
      setError('Please assign the task to a user');
      return;
    }

    if (taskData.todoCheckList.length === 0) {
      setError('Please add at least one TODO item to the checklist');
      return;
    }

    if (taskId) {
      // Update Task
      updateTask();
      return;
    }

    createTask();
  };

  // Get Task Details
  const getTaskDetails = async () => {};

  // Delete Task
  const deleteTask = async () => {};

  return (
    <DashboardLayout activeMenu="Create Task">
      <div className="mt-5">
        <div className="grid grid-cols-1 md:grid-cols-4 mt-4">
          <div className="form-card col-span-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-xl font-medium">
                {taskId ? 'Update Task' : 'Create Task'}
              </h2>

              {taskId && (
                <button
                  className="flex items-center gap-1.5 text-[13px] font-medium text-rose-600 bg-rose-50 rounded px-2 py-1 border border-rose-100 hover:border-rose-400 cursor-pointer"
                  onClick={() => setOpenDeleteAlert(true)}
                >
                  <LuTrash2 className="text-base" />
                  Delete
                </button>
              )}
            </div>

            <div className="mt-4">
              <label className="text-xs font-medium text-slate-600">
                Task Title
              </label>

              <input
                type="text"
                className="form-input"
                value={taskData.title}
                onChange={({ target }) =>
                  handleValueChange('title', target.value)
                }
                placeholder="Enter task title"
              />
            </div>

            <div className="mt-4">
              <label className="text-xs font-medium text-slate-600">
                Description
              </label>

              <textarea
                placeholder="Describe Task"
                row={4}
                value={taskData.description}
                onChange={({ target }) =>
                  handleValueChange('description', target.value)
                }
                className="form-input"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              {/* Item 1: Priority */}
              <div>
                <label className="text-xs font-medium text-slate-600">
                  Priority
                </label>
                <SelectDropdown
                  options={PRIORITY_DATA}
                  value={taskData.priority}
                  onChange={(value) => handleValueChange('priority', value)}
                  placeholder="Select Priority"
                />
              </div>

              {/* Item 2: Due Date */}
              <div>
                <label className="text-xs font-medium text-slate-600">
                  Due Date
                </label>
                <input
                  className="form-input"
                  placeholder="Select Due Date"
                  value={taskData.dueDate}
                  onChange={({ target }) => {
                    handleValueChange('dueDate', target.value);
                  }}
                  type="date"
                />
              </div>

              {/* Item 3: Assign To */}
              <div>
                <label className="text-xs font-medium text-slate-600">
                  Assign To
                </label>
                <SelectUsers
                  selectedUser={taskData.assignedTo}
                  setSelectedUser={(value) =>
                    handleValueChange('assignedTo', value)
                  }
                />
              </div>
            </div>

            {/* These sections were outside the broken grid and are correct */}
            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">
                TODO Checklist
              </label>
              <TodoListInput
                todoList={taskData?.todoCheckList}
                setTodoList={(value) =>
                  handleValueChange('todoCheckList', value)
                }
              />
            </div>

            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">
                Add Attachments
              </label>
              <AddAttachmentsInput
                attachments={taskData.attachments}
                setAttachments={(value) =>
                  handleValueChange('attachments', value)
                }
              />
            </div>

            {error && (
              <p className="text-xs font-medium text-red-500">{error}</p>
            )}

            <div className="flex justify-end mt-7">
              <button
                className="add-btn"
                onClick={handleSubmit}
                disabled={loading}
              >
                {taskId ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateTask;
