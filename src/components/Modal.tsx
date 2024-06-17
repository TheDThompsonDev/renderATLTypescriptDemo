import React, { useState, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (foodItem: string, calorieCount: number) => void;
  foodItem: string;
  calorieCount: number | null;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSave,
  foodItem: initialFoodItem,
  calorieCount: initialCalorieCount,
}) => {
  const [foodItem, setFoodItem] = useState(initialFoodItem);
  const [calorieCount, setCalorieCount] = useState<number | null>(
    initialCalorieCount
  );

  useEffect(() => {
    setFoodItem(initialFoodItem);
    setCalorieCount(initialCalorieCount);
  }, [initialFoodItem, initialCalorieCount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (foodItem && calorieCount !== null) {
      onSave(foodItem, calorieCount);
      setFoodItem("");
      setCalorieCount(null);
      onClose();
    } else {
      alert("Please fill in both fields.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <form onSubmit={handleSubmit}>
          <div className="input-section">
            <input
              type="text"
              value={foodItem}
              onChange={(e) => setFoodItem(e.target.value)}
              placeholder="Food Item"
            />
            <input
              type="number"
              value={calorieCount ?? ""}
              onChange={(e) =>
                setCalorieCount(e.target.value ? Number(e.target.value) : null)
              }
              placeholder="Calories"
            />
            <button type="submit">Add</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;
