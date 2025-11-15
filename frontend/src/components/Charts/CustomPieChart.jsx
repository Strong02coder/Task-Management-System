import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import CustomTooltip from './CustomTooltip';
import CustomLegend from './CustomLegend';

// A function to render the custom percentage label
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180;
  // Calculate the position for the label
  const radius = innerRadius + (outerRadius - innerRadius) * 1.2; // Position outside the slices
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Don't show a label for 0%
  if (percent === 0) {
    return null;
  }

  return (
    <text
      x={x}
      y={y}
      fill="#555" // Label color
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={14}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};


const CustomPieChart = ({ data, colors }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={90}  // Corrected radius
          outerRadius={130} // Corrected radius
          dataKey="value"
          nameKey="status"
          labelLine={false} // Disable the default line
          label={renderCustomizedLabel} // <-- THIS IS THE FIX
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CustomPieChart;
