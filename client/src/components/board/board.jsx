import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Line, Text } from "react-konva";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

const App = ({ color, clearToggle }) => {
  const [tool, setTool] = useState("pen");
  const [lines, setLines] = useState([]);
  const [eraserSize, setEraserSize] = useState(10);
  const isDrawing = useRef(false);

  // Listen for incoming drawing
  useEffect(() => {
    socket.on("draw", (data) => {
      setLines((prevLines) => [...prevLines, data]);
    });

    socket.on("clear", () => {
      setLines([]);
    });

    return () => {
      socket.off("draw");
      socket.off("clear");
    };
  }, []);

  useEffect(() => {
    setLines([]);
  }, [clearToggle]);

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    const newLine = {
      tool,
      points: [pos.x, pos.y],
      color,
      strokeWidth: tool === "eraser" ? eraserSize : 5,
    };
    setLines((prev) => [...prev, newLine]);
    socket.emit("draw", newLine);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const updatedLines = [...lines];
    const lastLine = updatedLines[updatedLines.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    updatedLines[updatedLines.length - 1] = lastLine;

    setLines(updatedLines);
    socket.emit("draw", lastLine);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  return (
    <div>
      <select value={tool} onChange={(e) => setTool(e.target.value)}>
        <option value="pen">Pen</option>
        <option value="eraser">Eraser</option>
      </select>

      {tool === "eraser" && (
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Eraser Size: {eraserSize}px
            <input
              type="range"
              min="5"
              max="50"
              value={eraserSize}
              onChange={(e) => setEraserSize(parseInt(e.target.value))}
              style={{ marginLeft: "10px" }}
            />
          </label>
        </div>
      )}

      <Stage
        width={window.innerWidth}
        height={window.innerHeight * 0.9}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <Layer>
          <Text text="Just start drawing" x={5} y={30} />
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.tool === "eraser" ? "white" : line.color}
              strokeWidth={line.strokeWidth}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={
                line.tool === "eraser" ? "destination-out" : "source-over"
              }
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default App;
