import React, { useState, useEffect } from 'react';
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
import Modal from '../../components/Tables/Modal';
import DeleteAlert from '../../components/Tables/DeleteAlert';

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
  const updateTask = async () => {
    setLoading(true);

    try {
      const todoList = taskData.todoCheckList?.map((item) => {
        const prevTodoCheckList = currentTask?.todoCheckList || [];
        const matchedTask = prevTodoCheckList.find((task) => task.text === item.text);

        return {
          text: item,
          completed: matchedTask ? matchedTask.completed : false,
        };
      });

      const response = await axiosInstance.put(
        API_PATHS.TASKS.UPDATE_TASK(taskId),
        {
          ...taskData,
          todoCheckList: todoList,
          dueDate: new Date(taskData.dueDate).toISOString(),
        }
      );

      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error("Failed to update task. Please check the console.");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

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

  // Get Task Details by ID
  const getTaskDetailsByID = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.TASKS.GET_TASK_BY_ID(taskId)
      );
      if (response.data) {
        const taskInfo = response.data;
        setCurrentTask(taskInfo);

        setTaskData({
          title: taskInfo.title,
          description: taskInfo.description,
          priority: taskInfo.priority,
          dueDate: taskInfo.dueDate ? moment(taskInfo.dueDate).format('YYYY-MM-DD') : null,
          assignedTo: taskInfo?.assignedTo?.map((item) => item._id) || [],
          todoCheckList: taskInfo?.todoCheckList?.map((item) => item?.text || []),
          attachments: taskInfo?.attachments || [],
        });
      }
    } catch (error) {
        console.error('Error fetching task details:', error);
        toast.error('Failed to fetch task details');
    }
  };

  // Delete Task
  const deleteTask = async () => {
    try {
      await axiosInstance.delete(API_PATHS.TASKS.DELETE_TASK(taskId));

      setOpenDeleteAlert(false);
      toast.success('Task deleted successfully');
      navigate('/admin/tasks');
    } catch (error) {
      console.error('Error deleting task:', error.response?.data?.message || error.message);
      toast.error('Failed to delete task');
    }
  };

  useEffect(() => {
    if (taskId) {
      getTaskDetailsByID();
    }
  }, [taskId]);

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

      <Modal isOpen={openDeleteAlert} onClose={() => setOpenDeleteAlert(false)} title="Delete Task">
        <DeleteAlert content = "Are you sure you want to delete this task?" onDelete={() => deleteTask()} />
      </Modal>
    </DashboardLayout>
  );
};

export default CreateTask;
