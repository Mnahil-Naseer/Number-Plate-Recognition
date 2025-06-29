import React, { useState } from "react";
import axios from "axios";  // Make sure axios is installed

export default function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState("");
  const [plateType, setPlateType] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult("");
    setPlateType("");
  };

  const handleUpload = async () => {
    if (!image) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", image);

    try {
      const response = await axios.post("http://127.0.0.1:5000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { plate, type } = response.data;
      setResult(plate);
      setPlateType(type);
      setHistory((prev) => [...prev, { plate, type }]);
    } catch (error) {
      console.error("Error during upload:", error);
      setResult("Error: Unable to process image.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setPreview(null);
    setResult("");
    setPlateType("");
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start">
      <nav className="w-full bg-blue-900 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">🚗 PlateDetect</h1>
        <div className="space-x-6 text-sm">
          <button
            onClick={() => {
              setShowHistory(false);
              handleReset();
            }}
            className="hover:text-yellow-300 text-lg transition"
          >
            Main
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className="hover:text-yellow-300 text-lg transition"
          >
            History
          </button>
        </div>
      </nav>

      {showHistory && (
        <div className="fixed right-0 top-14 h-full w-72 bg-white shadow-lg rounded-lg border-2 border-gray-500 z-20 p-4 overflow-y-auto">
          <h3 className="text-md font-bold mb-2 text-gray-700">📜 Recognition History</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            {history.map((item, index) => (
              <li
                key={index}
                className="flex justify-between px-2 py-1 bg-gray-100 border rounded text-xs"
              >
                <span>{item.plate}</span>
                <span
                  className={`${
                    item.type === "Government Plate" ? "text-red-600" : "text-blue-600"
                  }`}
                >
                  {item.type}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white shadow-2xl rounded-xl p-6 w-full max-w-md text-center mt-10 border-2 border-gray-400 relative z-10">
        {preview && (
          <button
            onClick={handleReset}
            className="absolute top-2 right-2 text-xs text-gray-500 hover:text-red-600"
          >
            ⬅️ Go Back
          </button>
        )}

        <h2 className="text-2xl font-bold mb-4 text-gray-800">Number Plate Recognition</h2>

        {!preview ? (
          <div className="flex items-center justify-center h-40">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-sm text-center"
            />
          </div>
        ) : (
          <>
            <img src={preview} alt="Preview" className="w-full rounded-lg mb-4" />
            <button
              onClick={handleUpload}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition"
            >
              {loading
                ? "Processing..."
                : result
                ? "✔️ Plate Recognized"
                : "Recognize Plate"}
            </button>
          </>
        )}

        {result && (
          <div className="mt-4 text-lg font-semibold">
            <div className="text-green-700">🔍 Result: {result}</div>
            <div
              className={`mt-1 ${
                plateType === "Government Plate" ? "text-red-600" : "text-blue-600"
              }`}
            >
              🚘 Type: {plateType}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
