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

interface Document {
  $id: string;
  $createdAt: string;
  food: string;
  calories: number;
  date: string; // Add this line
  $collectionId: string;
  $databaseId: string;
  $updatedAt: string;
  $permissions: string[];
}

//The ListDocumentsResponse interface
//describes the structure of the response when fetching documents from the database.
//It includes the total number of documents and an array of Document objects.
interface ListDocumentsResponse {
  total: number;
  documents: Document[];
}

// Helper function to get local midnight date string
const getCurrentLocalDateTimeString = (date: Date): string => {
  return date.toISOString();
};

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
    const newDate = new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000);
    setSelectedDate(newDate);
    setCurrentPage(1);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000);
    setSelectedDate(newDate);
    setCurrentPage(1);
  };

  const fetchAndDisplayData = (date: Date, page: number) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    databases
      .listDocuments<Document>("658ef821cfb41e5aed8e", "658ef82cef38dc12b638", [
        Query.greaterThanEqual("date", startOfDay.toISOString()),
        Query.lessThan("date", endOfDay.toISOString()),
        Query.limit(itemsPerPage),
        Query.offset((page - 1) * itemsPerPage),
      ])
      .then((response: ListDocumentsResponse) => {
        console.log(response);
        const documents = response.documents.map((doc) => ({
          food: doc.food,
          calories: doc.calories,
          date: new Date(doc.date),
        }));
        setCalories(documents);
        setTotalCalories(
          documents.reduce((sum, item) => sum + item.calories, 0)
        );
      })
      .catch((error: Error) => console.error("Error fetching data:", error));
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
