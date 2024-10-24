import { useState, useEffect } from "react";
import "./index.css";
import Modal from "./components/Modal";
import ProgressBar from "./components/ProgressBar";
import CalorieTable from "./components/CalorieTable";
import { databases, ID, Query } from "./appwrite";
import { ModalState } from "./types/modalTypes";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Document {
  $id: string;
  $createdAt: string;
  food: string;
  calories: number;
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
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
    setCurrentPage(1);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
    setCurrentPage(1);
  };

  const fetchAndDisplayData = (date: Date, page: number) => {
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    databases
      .listDocuments<Document>("658ef821cfb41e5aed8e", "658ef82cef38dc12b638", [
        Query.greaterThanEqual("$createdAt", startOfDay.toISOString()),
        Query.lessThanEqual("$createdAt", endOfDay.toISOString()),
        Query.limit(itemsPerPage),
        Query.offset((page - 1) * itemsPerPage),
      ])
      .then((response: ListDocumentsResponse) => {
        const documents = response.documents.map((doc) => ({
          food: doc.food,
          calories: doc.calories,
          date: new Date(doc.$createdAt),
        }));
        setCalories(documents);
        setTotalCalories(
          documents.reduce((sum, item) => sum + item.calories, 0)
        );
      })
      .catch((error: Error) => console.error("Error fetching data:", error));
  };

  const addCalories = (foodItem: string, calorieCount: number) => {
    const formattedDate = selectedDate.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });

    databases
      .createDocument(
        "658ef821cfb41e5aed8e",
        "658ef82cef38dc12b638",
        ID.unique(),
        {
          food: foodItem,
          calories: calorieCount,
          date: formattedDate,
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

      <div className="pagination">
        <button onClick={goToPreviousDay}>Previous Day</button>
        <span>{selectedDate.toLocaleDateString()}</span>
        {!isToday(selectedDate) && (
          <button onClick={goToNextDay}>Next Day</button>
        )}
      </div>
    </div>
  );
};

export default App;
