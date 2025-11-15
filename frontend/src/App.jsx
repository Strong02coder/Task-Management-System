import React, { useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';
import Dashboard from './pages/Admin/Dashboard';
import ManageUsers from './pages/Admin/ManageUsers';
import ManageTasks from './pages/Admin/ManageTasks';
import CreateTask from './pages/Admin/CreateTask';

import UserDashboard from './pages/User/UserDashboard';
import MyTasks from './pages/User/MyTasks';
import ViewTaskDetails from './pages/User/ViewTaskDetails';

import PrivateRoute from './routes/PrivateRoute';
import UserProvider, { UserContext } from './context/UserContext';
import { Toaster } from 'react-hot-toast';

const App = () => {
  return (
    <UserProvider>
      <div>
        <Router>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Admin Routes */}
            <Route element={<PrivateRoute allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/manage-users" element={<ManageUsers />} />
              <Route path="/admin/manage-tasks" element={<ManageTasks />} />
              <Route path="/admin/create-task" element={<CreateTask />} />
            </Route>

            {/* User Routes */}
            <Route element={<PrivateRoute allowedRoles={['user']} />}>
              <Route path="/user/dashboard" element={<UserDashboard />} />
              <Route path="/user/my-tasks" element={<MyTasks />} />
              <Route path="/user/task-details/:id" element={<ViewTaskDetails />} />
            </Route>

            {/* --- FIX: Root path "/" now redirects users --- */}
            <Route path="/" element={<Root />} /> 
            
            {/* The duplicate /login route has been removed */}
          </Routes>
        </Router>
      </div>

      <Toaster 
        toastOptions={{
          className: '',
          style: {
            fontSize: '14px',
          },
        }}
      />
    </UserProvider>
  )
}

export default App;

const Root = () => {
  const { user, loading } = useContext(UserContext);

  // Show a blank page or loading spinner while checking
  if (loading) return null; 

  if (!user) {
    return <Navigate to='/login' />
  } 

  // Assuming the role for a normal user is 'admin' or 'member'
  return user.role === 'admin' ? <Navigate to='/admin/dashboard' /> : <Navigate to='/user/dashboard' />;
};
