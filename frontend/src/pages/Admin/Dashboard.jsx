import React, { useContext, useEffect, useState } from 'react';
import { useUserAuth } from '../../hooks/useUserAuth';
import { UserContext } from '../../context/UserContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import moment from 'moment';
import { addThousandsSeparator } from '../../utils/helper';
import InfoCard from '../../components/Cards/InfoCard';
import { LuArrowRight } from 'react-icons/lu';
import TaskListTable from '../../components/Tables/TaskListTables';
import CustomPieChart from '../../components/Charts/CustomPieChart';
import CustomBarChart from '../../components/Charts/CustomBarChart';

const COLORS = ['#8D51FF', '#00B8DB', '#7BCE00'];

const Dashboard = () => {
  useUserAuth(); // Custom hook to handle user authentication

  const { user } = useContext(UserContext);

  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);

  // Handle See More button click
  const onSeeMore = () => {
    navigate('/admin/tasks');
  };

  useEffect(() => {
    // Prepare Chart Data (accepts the charts object directly to avoid extra dependencies)
    const prepareChartData = (charts) => {
      const taskDistribution = charts?.taskDistribution || null;
      const taskPriorityLevels = charts?.taskPriorityLevels || null;

      const taskDistributionData = [
        { status: 'Pending', value: taskDistribution?.Pending || 0 },
        { status: 'In Progress', value: taskDistribution?.InProgress || 0 },
        { status: 'Completed', value: taskDistribution?.Completed || 0 },
      ];

      setPieChartData(taskDistributionData);

      const PriorityLevelData = [
        { priority: 'Low', value: taskPriorityLevels?.Low || 0 },
        { priority: 'Medium', value: taskPriorityLevels?.Medium || 0 },
        { priority: 'High', value: taskPriorityLevels?.High || 0 },
      ];

      setBarChartData(PriorityLevelData);
    };

    const getDashboardData = async () => {
      try {
        const response = await axiosInstance.get(
          API_PATHS.TASKS.GET_DASHBOARD_DATA
        );
        if (response.status === 200) {
          setDashboardData(response.data);
          prepareChartData(response.data?.charts || null);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    getDashboardData();
    return () => {};
  }, []);

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="card my-5">
        
        {/* 1. GREETING */}
        <div>
          <div className="col span-3">
            <h2 className="text-semibold md:text-2xl">Good Morning! {user?.name}</h2>
            <p className="text-xs md:text-[13px] text-gray-500 mt-1.5">
              {moment().format('MMMM Do YYYY')}
            </p>
          </div>
        </div>

        {/* 2. INFO CARDS (Moved to the bottom) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-6 mt-5">
          <InfoCard
            label="Total Tasks"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.All || 0
            )}
            color="bg-blue-500"
          />
          <InfoCard
            label="Pending Tasks"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.Pending || 0
            )}
            color="bg-violet-500"
          />
          <InfoCard
            label="In Progress Tasks"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.InProgress || 0
            )}
            color="bg-cyan-500"
          />
          <InfoCard
            label="Completed Tasks"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.Completed || 0
            )}
            color="bg-lime-500"
          />
        </div>
      </div>

      <div>
        {/* 3. CHARTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 mt-5">
          {/* PIE CHART CARD */}
          <div className="card">
            <div className="flex items-center justify-between">
              <h5 className="font-medium">Task Distribution</h5>
            </div>
            <CustomPieChart data={pieChartData} colors={COLORS} />
          </div>

          {/* BAR CHART CARD */}
          <div className="card">
            <div className="flex items-center justify-between">
              <h5 className="font-medium">Task Priority Levels</h5>
            </div>
            <CustomBarChart data={barChartData} colors={COLORS} />
          </div>
        </div>
      </div>

      {/* RECENT TASKS (This section remains unchanged) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-4 md:my-6">
        <div className="md:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between">
              <h5 className="text-lg">Recent Tasks</h5>
              <button className="card-btn" onClick={onSeeMore}>
                View All <LuArrowRight className="text-base" />
              </button>
            </div>
            <TaskListTable tableData={dashboardData?.recentTasks || []} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
