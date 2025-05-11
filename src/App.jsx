import React, { useState } from "react";

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

  const handleUpload = () => {
    if (!image) return;
    setLoading(true);
    setTimeout(() => {
      const fakeResult = Math.random() > 0.5 ? "GOV-5678" : "ABC-1234";
      const isGov = /GOV|GOVT|G-/.test(fakeResult.toUpperCase());
      const type = isGov ? "Government Plate" : "Private Plate";
      setResult(fakeResult);
      setPlateType(type);
      setHistory((prev) => [...prev, { plate: fakeResult, type }]);
      setLoading(false);
    }, 2000);
  };

  const handleReset = () => {
    setImage(null);
    setPreview(null);
    setResult("");
    setPlateType("");
  };

  return (
    <div
      className="min-h-full w-full flex flex-col"
    >
      {/* Navbar */}
      <nav className="w-full bg-blue-900 text-white p-4 flex justify-between items-center shadow-md z-10 relative">
        <h1 className="text-xl font-bold ">🚗 PlateDetect</h1>
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

      {/* Content */}
      <div className="flex-grow flex items-center justify-center px-4 py-10 relative">
        {/* History Side Panel */}
        {showHistory && (
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-lg border-l border-gray-300 z-20 p-4 overflow-y-auto">
            <h3 className="text-md font-bold mb-2 text-gray-700">📜 Recognition History</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              {history.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between px-2 py-1 bg-gray-100 border rounded text-xs"
                >
                  <span>{item.plate}</span>
                  <span
                    className={`$ {
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

        <div className="bg-white relative shadow-2xl rounded-xl p-6 w-full max-w-md text-center items-center justify-center border-2  border-gray-400 z-10">
          {preview && (
            <button
              onClick={handleReset}
              className="absolute top-2 right-2 text-xs text-gray-500 hover:text-red-600"
            >
              ⬅️ Go Back
            </button>
          )}

          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Number Plate Recognition
          </h2>

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
              <img src={preview} alt="Preview" className="w-50 rounded-lg mb-4" />
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
                className={`mt-1 $ {
                  plateType === "Government Plate" ? "text-red-600" : "text-blue-600"
                }`}
              >
                🚘 Type: {plateType}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
