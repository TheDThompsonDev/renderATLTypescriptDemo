import React from "react";

type CalorieItem = {
  readonly food: string;
  readonly calories: number;
  readonly date: Date;
};

type CalorieTableProps = {
  calories: ReadonlyArray<CalorieItem>;
};

const CalorieTable: React.FC<CalorieTableProps> = ({ calories }) => {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th
            style={{
              textAlign: "left",
              padding: "10px",
              borderBottom: "1px solid #ddd",
            }}
          >
            Date
          </th>
          <th
            style={{
              textAlign: "left",
              padding: "10px",
              borderBottom: "1px solid #ddd",
            }}
          >
            Food Item
          </th>
          <th
            style={{
              textAlign: "right",
              padding: "10px",
              borderBottom: "1px solid #ddd",
            }}
          >
            Calories
          </th>
        </tr>
      </thead>
      <tbody>
        {calories.map((item, index) => (
          <tr key={index}>
            <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
              {item.date.toLocaleString()}
            </td>
            <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
              {item.food}
            </td>
            <td
              style={{
                textAlign: "right",
                padding: "10px",
                borderBottom: "1px solid #ddd",
              }}
            >
              {item.calories}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CalorieTable;
