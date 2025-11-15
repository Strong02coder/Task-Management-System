import React, { useState } from 'react'
import AuthLayout from '../../components/layouts/AuthLayout'
import { validateEmail } from '../../utils/helper';
import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector';
import Input from '../../components/Inputs/Input';
import { Link } from 'react-router-dom';
import { API_PATHS } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import uploadImage from '../../utils/uploadImage';

const SignUp = () => {
  const [profilePicture, setProfilePicture] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminInviteToken, setAdminInviteToken] = useState('');

  const [error, setError] = useState(null);

  const { updateUser } = React.useContext(UserContext);
  const navigate = useNavigate();

    // Handle SignUp form submission
    const handleSignUp = async (e) => {
      e.preventDefault();

      let profileImageUrl = '';

      if (!fullName) {
        setError('Please enter your Full Name.');
        return;
      }
  
      if (!validateEmail(email)) {
        setError('Please enter a valid email address.');
        return;
      }
  
      if (password.length < 8) {
        setError('Please enter a password with at least 8 characters.');
        return;
      }
      setError('');

      // SignUp API Call
      try {
        
        // Upload profile picture if present
        if (profilePicture) {
          const imgUploadRes = await uploadImage(profilePicture);
          profileImageUrl = imgUploadRes.imageUrl || '';
        }

        // Make API call to SignUp
        const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
          name: fullName,
          email,
          password,
          profileImageUrl,
          adminInviteToken
        });

        const { token, role } = response.data;

        if (token) {
          // Store token in localStorage
          localStorage.setItem('accessToken', token);
          updateUser(response.data);

          // Redirect based on user role
          if (role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/user/dashboard');
          }
        } 
      } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
          setError(error.response.data.message);
        } else {
          setError('An error occurred during Sign Up. Please try again.');
        }
      }
    }

  return (
    <AuthLayout>
      <div className='lg:w-full h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center'>
        <h3 className='text-xl font-semibold text-black'>Create an Account</h3>
        <p className='text-xs text-slate-700 mt-[5px] mb-6'>Join us today by entering your details below.</p>

        <form onSubmit={handleSignUp}>
          <ProfilePhotoSelector image={profilePicture} setImage={setProfilePicture} />
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input
              value={fullName}
              onChange={({ target }) => setFullName(target.value)}
              label="Full Name"
              placeholder="Enter your full name"
              type="text"
              required
            />

            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="Email Address"
              placeholder="Enter your email"
              type="text"
              required
            />

            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="Enter Password"
              placeholder="Min 8 characters"
              type="password"
              required
            />

            <Input
              value={adminInviteToken}
              onChange={({ target }) => setAdminInviteToken(target.value)}
              label="Admin Invite Token (Optional)"
              placeholder="6 Digit Token"
              type="text"
            />
          </div>

          {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

          <button type='submit' className='btn-primary'>
            SIGN UP
          </button>

          <p className='text-[13px] text-slate-800 mt-3'>
            Already have an account?{' '}
            <Link className="font-medium text-blue-600 underline" to="/login">
              Login
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  )
}

export default SignUp;
