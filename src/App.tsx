import { useState, useEffect } from "react";
import "./index.css";
import Modal from "./components/Modal";
import ProgressBar from "./components/ProgressBar";
import CalorieTable from "./components/CalorieTable";
import { databases, ID, Query } from "./appwrite";
import { ModalState } from "./types/modalTypes";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./App.css";
import { getProperty } from "./utils/inference";
import { CalorieResponse } from "./types/conditionalTypes";

interface AppDocument {
  $id: string;
  $createdAt: string;
  food: string;
  calories: number;
  date: string;
  $collectionId: string;
  $databaseId: string;
  $updatedAt: string;
  $permissions: string[];
}

// type CaloriesTotal<TCalories> = {
//   data: TCalories;
// };

// type dailyCaloriesTotal = CaloriesTotal<{
//   calories: number;
// }>;

//A Helper Function to get the current date and time in the local timezone by having :string
//before the function we are saying the return type of the function is a string
//it infers the return type from the function this way
const getCurrentLocalDateTimeString = (date: Date): string => {
  return date.toISOString();
};

//A Helper Function to format the date to the format of MM/dd/yyyy
//before the function we are saying the return type of the function is a string
//it infers the return type from the function this way
//the function takes a date as an argument and returns a string
//the function uses the toLocaleDateString method to format the date
//the toLocaleDateString method takes two arguments:
//1. undefined: it uses the default locale of the JavaScript runtime
//2. An object that contains one or more properties that specify comparison options.

const formatDate = (date: Date): string => {
  return date.toLocaleDateString(undefined, {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  });
};

const App = () => {
  const [modalState, setModalState] = useState<ModalState>({ state: "closed" });
  const [calories, setCalories] = useState<
    { food: string; calories: number; date: Date }[]
  >([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const dailyGoal = 2000;

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
    setCurrentPage(1);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
    setCurrentPage(1);
  };

  // Our first intro to a generic function
  // The function takes a date and a page number as arguments
  // The function returns a Promise that resolves to a CalorieResponse object
  // The CalorieResponse object has two properties:
  // 1. data: an array of AppDocument objects representing the fetched data
  // 2. error: a string representing the error message if the fetch operation fails

  //You can think of T as a placeholder for any type that will have the structure of AppDocument.
  //This makes the function reusable with different kinds of documents in the future, while ensuring
  //they always contain certain fields.
  const fetchAndDisplayData = async <T extends AppDocument>(
    date: Date,
    page: number
  ): Promise<CalorieResponse<"success" | "error">> => {
    //This means the function will return a Promise that resolves to a CalorieResponse
    //object, and this object will either contain "success" or "error" as a result.
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      const response = await databases.listDocuments<T>(
        "658ef821cfb41e5aed8e", //appwrite database id
        "658ef82cef38dc12b638", //appwrite collection id
        [
          Query.greaterThanEqual("date", startOfDay.toISOString()),
          Query.lessThan("date", endOfDay.toISOString()),
          Query.limit(itemsPerPage),
          Query.offset((page - 1) * itemsPerPage),
        ]
      );

      const documents: AppDocument[] = response.documents.map((doc) => ({
        $id: doc.$id,
        $createdAt: doc.$createdAt,
        food: getProperty(doc, "food") as string,
        calories: getProperty(doc, "calories") as number,
        date: getProperty(doc, "date") as string,
        $collectionId: doc.$collectionId,
        $databaseId: doc.$databaseId,
        $updatedAt: doc.$updatedAt,
        $permissions: doc.$permissions,
      }));

      setCalories(
        documents.map((doc) => ({
          food: getProperty(doc, "food"),
          calories: getProperty(doc, "calories"),
          date: new Date(getProperty(doc, "date")),
        }))
      );
      setTotalCalories(
        documents.reduce((sum, item) => sum + getProperty(item, "calories"), 0)
      );

      return { data: documents as unknown as Document[] };
    } catch (error: unknown) {
      console.error("Error fetching data:", error);
      return { error: (error as Error).message };
    }
  };

  const addCalories = (foodItem: string, calorieCount: number) => {
    const currentDateTime = getCurrentLocalDateTimeString(new Date());

    databases
      .createDocument(
        "658ef821cfb41e5aed8e",
        "658ef82cef38dc12b638",
        ID.unique(),
        {
          food: foodItem,
          calories: calorieCount,
          date: currentDateTime,
        }
      )
      .then(() => {
        fetchAndDisplayData(selectedDate, currentPage);
      })
      .catch((error: Error) =>
        console.error("Error creating document:", error)
      );
  };

  useEffect(() => {
    fetchAndDisplayData(selectedDate, currentPage);
  }, [selectedDate, currentPage]);

  return (
    <div className="container">
      <div className="heading">
        <h2>Calorie Tracker</h2>
        <button
          onClick={() =>
            setModalState({ state: "open", foodItem: "", calorieCount: null })
          }
        >
          Add Food
        </button>
      </div>

      <div className="filter-section">
        <DatePicker
          selected={selectedDate}
          onChange={(date: Date | null) => {
            if (date) {
              setSelectedDate(date);
              setCurrentPage(1);
            }
          }}
          dateFormat="MM/dd/yyyy"
        />
      </div>

      {modalState.state === "open" && (
        <Modal
          isOpen={modalState.state === "open"}
          onClose={() => setModalState({ state: "closed" })}
          onSave={(foodItem, calorieCount) => {
            addCalories(foodItem, calorieCount);
            setModalState({ state: "closed" });
          }}
          foodItem={modalState.foodItem}
          calorieCount={modalState.calorieCount}
        />
      )}

      <div className="display-section">
        <ProgressBar progress={totalCalories} goal={dailyGoal} />
        <CalorieTable calories={calories} />
        <div className="display-calories-section">
          <div>
            Total Calories: <span>{totalCalories}</span>
          </div>
        </div>
      </div>

      <div className="pagination-container">
        <button onClick={goToPreviousDay}>Previous Day</button>
        <span className="date-display">{formatDate(selectedDate)}</span>
        {!isToday(selectedDate) ? (
          <button onClick={goToNextDay}>Next Day</button>
        ) : (
          <div className="placeholder"></div>
        )}
      </div>
    </div>
  );
};

export default App;
