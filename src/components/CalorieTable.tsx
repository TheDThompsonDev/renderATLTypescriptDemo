import React from "react";

type CalorieItem = {
  readonly food: string;
  readonly calories: number;
  readonly date: Date;
};

type CalorieTableProps = {
  calories: ReadonlyArray<CalorieItem>;
};

const formatDate = (date: Date): string => {
  return date.toLocaleString(undefined, {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const CalorieTable: React.FC<CalorieTableProps> = ({ calories }) => {
  return (
    <table
      style={{
        width: "100%",
        maxWidth: "800px",
        margin: "0 auto",
        borderCollapse: "collapse",
      }}
    >
      <thead>
        <tr>
          <th
            style={{
              textAlign: "left",
              padding: "10px",
              borderBottom: "1px solid #ddd",
              width: "30%",
            }}
          >
            Date
          </th>
          <th
            style={{
              textAlign: "center",
              padding: "10px",
              borderBottom: "1px solid #ddd",
              width: "50%",
            }}
          >
            Food Item
          </th>
          <th
            style={{
              textAlign: "right",
              padding: "10px",
              borderBottom: "1px solid #ddd",
              width: "20%",
            }}
          >
            Calories
          </th>
        </tr>
      </thead>
      <tbody>
        {calories.map((item, index) => (
          <tr key={index}>
            <td
              style={{
                padding: "10px",
                borderBottom: "1px solid #ddd",
                whiteSpace: "nowrap",
              }}
            >
              {formatDate(item.date)}
            </td>
            <td
              style={{
                padding: "10px",
                borderBottom: "1px solid #ddd",
                textAlign: "center",
              }}
            >
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
