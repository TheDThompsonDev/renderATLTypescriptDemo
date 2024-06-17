import React from "react";

interface CalorieTableProps {
  calories: { food: string; calories: number }[];
}

const CalorieTable: React.FC<CalorieTableProps> = ({ calories }) => {
  return (
    <table id="calorie-table">
      <thead>
        <tr>
          <th>Food Item</th>
          <th>Calories</th>
        </tr>
      </thead>
      <tbody>
        {calories.map((item, index) => (
          <tr key={index}>
            <td>{item.food}</td>
            <td>{item.calories}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CalorieTable;
