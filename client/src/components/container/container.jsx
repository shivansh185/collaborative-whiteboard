import React, { useState } from "react";
import Board from "../board/board";
import "./style.css";
import { io } from "socket.io-client";
const socket = io("http://localhost:3001");

export default function Container() {
  const [color, setColor] = useState("#df4b26");
  const [clearToggle, setClearToggle] = useState(false);

const handleClear = () => {
  setClearToggle((prev) => !prev);
  socket.emit("clear");
};

  return (
    <div className="container">
      <div className="color-picker-container">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
        <button className="clear-btn" onClick={handleClear}>
          Clear Board
        </button>
      </div>

      <div className="shapes">
        {/* Placeholder for future shape tools */}
      </div>

      <div className="board-container">
        <Board color={color} clearToggle={clearToggle} />
      </div>
    </div>
  );
}
