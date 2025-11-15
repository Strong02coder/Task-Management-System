import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { LuUsers } from 'react-icons/lu';
import Modal from '../Tables/Modal';
import AvatarGroup from '../Tables/AvatarGroup';

const SelectUsers = ({ selectedUser, setSelectedUser }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [temperarySelectedUser, setTemporarySelectedUser] = useState(selectedUser);

  const getAllUsers = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
      if (response.data?.length > 0) {
        setAllUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const toggleUserSelection = (userId) => {
    setTemporarySelectedUser((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
    );
  };

  const handleAssign = () => {
    setSelectedUser(temperarySelectedUser);
    setIsModalOpen(false);
  };

  const selectedUserAvatars = allUsers
    .filter((user) => selectedUser.includes(user._id))
    .map((user) => user.profileImageUrl);

  useEffect(() => {
    getAllUsers();
  }, []);

  useEffect(() => {
    if (selectedUser.length === 0) {
      setTemporarySelectedUser([]);
    }

    return () => {};
  }, [selectedUser]);

  return (
    <div className="space-y-4 mt-2">
      {selectedUserAvatars.length === 0 && (
        <button className="card-btn h-10.5 w-full" onClick={() => setIsModalOpen(true)}>
          <LuUsers /> Add Members
        </button>
      )}

      {selectedUserAvatars.length > 0 && (
        <div className="cursor-pointer" onClick={() => setIsModalOpen(true)}>
          <AvatarGroup avatars={selectedUserAvatars} maxVisible={4} />
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Select Users"
      >
        <div className="h-[60vh] overflow-y-auto">
          {allUsers.map((user) => (
            <div
              key={user._id}
              className="flex items-center gap-4 p-3 border-b border-gray-200"
            >
              
              {/* THE FIX: Added '|| null' to the src prop */}
              <img
                src={user.profileImageUrl || null}
                alt={user.name}
                className="w-10 h-10 rounded-full"
              />
              
              <div className="flex-1">
                <p className="font-medium text-gray-800">{user.name}</p>
                <p className="text-[13px] text-gray-500">{user.email}</p>
              </div>
              <input
                type="checkbox"
                checked={temperarySelectedUser.includes(user._id)}
                onChange={() => toggleUserSelection(user._id)}
                className="w-4 h-4 text-blue-500 bg-gray-100 border-gray-300 rounded-sm outline-none accent-blue-600"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            className="card-btn"
            onClick={() => setIsModalOpen(false)}
          >
            CANCEL
          </button>
          <button className="card-btn-fill" onClick={handleAssign}>
            DONE
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default SelectUsers;
