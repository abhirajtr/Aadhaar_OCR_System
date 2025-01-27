import axios from "axios";
import { useState } from "react";

const backendUrl = import.meta.env.VITE_BACKEND_URL;


interface Result {
  name: string;
  number: string;
  dob: string;
  address: string;
}
const App = () => {

  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [result, setResult] = useState<Result | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
    const file = e.target.files?.[0];
    if (file) {
      if (side === "front") {
        setFrontImage(file);
      } else {
        setBackImage(file);
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();
    if (!frontImage && !backImage) return;

    const formData = new FormData();
    if (frontImage) {
      formData.append('front', frontImage);
    }
    if (backImage) {
      formData.append('back', backImage);
    }
    try {
      const response = await axios.post(`${backendUrl}/api/ocr`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(response.data)
      // console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">

      <h1
        className="text-3xl font-bold text-center mb-8 text-gray-800"
      >Aadhaar OCR system</h1>
      <div className="text-center mb-6">
        <p className="text-gray-600 text-lg">
          Upload the front and back images of your Aadhaar card to process it with our OCR system.
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Ensure the images are clear and the text is legible for accurate results.
        </p>
      </div>
      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Front Side of Aadhaar</h2>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "front")}
              className="mb-4 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full 
              file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {frontImage && (
              <div>
                <img src={URL.createObjectURL(frontImage)} alt="front of  aadhar"
                  className="object-contain max-h-64"
                />
              </div>
            )}
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Back Side of Aadhaar</h2>
            <input
              type="file"
              accept="image/*"
              alt="back of Aadhaar"
              onChange={(e) => handleImageUpload(e, "back")}
              className="mb-4 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full 
              file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {backImage && (
              <div>
                <img src={URL.createObjectURL(backImage)} alt="front of  aadhar"
                  className="object-contain max-h-64"
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={!frontImage || !backImage}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full
            disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition duration-300
            ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
          >
            Process Aadhaar
          </button>
        </div>
      </form>
      {result && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">OCR Results</h2>
          {/* {result} */}
          <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded-md text-sm">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export default App