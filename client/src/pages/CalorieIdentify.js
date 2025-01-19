import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/CalorieIdentify.css";

const CalorieIdentify = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const qrDataString = location.state?.dishData || null;
  const qrData = ensureJSON(qrDataString);

  const ingredientsData = qrData?.ingredients || [];

  const [ingredients, setIngredients] = useState(
    ingredientsData.map((ingredient) => ({
      name: ingredient.name,
      calories: parseCalories(ingredient.calories),
      quantity: 1,
      imgURL: ingredient.imgURL || null, // Dynamically handle image URLs
    }))
  );

  function parseCalories(calorieString) {
    if (!calorieString || typeof calorieString !== "string") return 0;
    const match = calorieString.match(/(\d+)/);
    return match ? parseInt(match[0], 10) : 0;
  }

  function ensureJSON(data) {
    if (typeof data === "object" && data !== null) return data;
    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch (error) {
        console.error("Failed to parse JSON string:", error);
        return { rawData: data };
      }
    }
    return { rawData: data };
  }

  const calculateTotalCalories = () => {
    return ingredients.reduce(
      (total, ingredient) => total + ingredient.calories * ingredient.quantity,
      0
    );
  };

  const updateQuantity = (name, delta) => {
    setIngredients((prevIngredients) =>
      prevIngredients.map((ingredient) =>
        ingredient.name === name
          ? {
              ...ingredient,
              quantity: Math.max(0, ingredient.quantity + delta),
            }
          : ingredient
      )
    );
  };

  const totalCalories = calculateTotalCalories();

  const getCalorieMeter = () => {
    if (totalCalories > 700) return "High";
    if (totalCalories > 300) return "Medium";
    return "Low";
  };

  const getCalorieMeterColor = () => {
    switch (getCalorieMeter()) {
      case "High":
        return "#e63946"; // Red
      case "Medium":
        return "#fca311"; // Orange
      case "Low":
        return "#2ecc71"; // Green
      default:
        return "#ffffff"; // Default (white)
    }
  };

  if (!qrData || !qrData.ingredients) {
    return (
      <div className="no-data">
        <h1> No Dish Data Found</h1>
        <p>Please scan a valid QR code to identify the dish and its calories.</p>
        <button onClick={() => navigate("/")}>Scan Another Dish</button>
      </div>
    );
  }

  return (
    <div className="calorie-identify">
      <h1>Dish Information</h1>

      <div className="dish-details">
        <h2>{qrData.object}</h2>
        {qrData.imgURL && (
          <img
            src={qrData.imgURL}
            alt={qrData.object}
            className="dish-image"
          />
        )}
        <h3>Ingredients:</h3>
        <ul>
          {ingredients.map((ingredient, index) => (
            <li key={index} className="ingredient-item">
              {ingredient.imgURL && (
                <img
                  src={ingredient.imgURL}
                  alt={ingredient.name}
                  className="ingredient-image"
                />
              )}
              <span>
                {ingredient.name} - {ingredient.calories} cal x{" "}
                {ingredient.quantity}
              </span>
              <div className="quantity-controls">
                <button onClick={() => updateQuantity(ingredient.name, -1)}>-</button>
                <button onClick={() => updateQuantity(ingredient.name, 1)}>+</button>
              </div>
            </li>
          ))}
        </ul>
        <h3 className="total-calories">
          <span>Total Calories:</span>
          <span
            className="calorie-value"
            style={{
              color: getCalorieMeterColor(),
            }}
          >
            {totalCalories} cal
          </span>
        </h3>

        <div className="additional-info">
          <p>
            <strong>Calorie Meter:</strong>{" "}
            <span
              className="calorie-meter"
              style={{
                backgroundColor: getCalorieMeterColor(),
                padding: "5px 10px",
                borderRadius: "5px",
                color: "#fff",
              }}
            >
              {getCalorieMeter()}
            </span>
          </p>
          <p>
            <strong>Not Recommended For:</strong>{" "}
            <span className="not-recommended">
              {qrData.notRecommendedForDiseases.join(", ")}
            </span>
          </p>
          <p>
            <strong>Common Uses:</strong> {qrData.commonUses}
          </p>
          <p>
            <strong>Nutritional Value:</strong> {qrData.nutritionalValue}
          </p>
        </div>
      </div>

      <button onClick={() => navigate("/")}>Scan Another Dish</button>
    </div>
  );
};

export default CalorieIdentify;