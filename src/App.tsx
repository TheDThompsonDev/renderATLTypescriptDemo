import { useState, useEffect } from "react";
import "./index.css";
import Modal from "./components/Modal";
import ProgressBar from "./components/ProgressBar";
import CalorieTable from "./components/CalorieTable";
import { databases, ID } from "./appwrite";
import { ModalState } from "./types/modalTypes";

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
    { food: string; calories: number }[]
  >([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const dailyGoal = 2000;

  //The fetchAndDisplayData function fetches data from the Appwrite database and
  //updates the state with the fetched data.
  const fetchAndDisplayData = () => {
    databases
      .listDocuments<Document>("658ef821cfb41e5aed8e", "658ef82cef38dc12b638")
      .then((response: ListDocumentsResponse) => {
        const documents = response.documents.map((doc) => ({
          food: doc.food,
          calories: doc.calories,
        }));
        console.log(documents);
        setCalories(documents);
        setTotalCalories(
          documents.reduce((sum, item) => sum + item.calories, 0)
        );
      })
      .catch((error: Error) => console.error("Error fetching data:", error));
  };

  const addCalories = (foodItem: string, calorieCount: number) => {
    setCalories((prevCalories) => [
      ...prevCalories,
      { food: foodItem, calories: calorieCount },
    ]);
    setTotalCalories((prevTotal) => prevTotal + calorieCount);

    databases
      .createDocument(
        "658ef821cfb41e5aed8e",
        "658ef82cef38dc12b638",
        ID.unique(),
        {
          food: foodItem,
          calories: calorieCount,
        }
      )
      .then(() => {
        fetchAndDisplayData();
      })
      .catch((error: Error) =>
        console.error("Error creating document:", error)
      );
  };

  useEffect(() => {
    fetchAndDisplayData();
  }, []);

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
    </div>
  );
};

export default App;
