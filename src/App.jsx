import { useState } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import MainContent from './components/MainContent';
import './styles/global.css';
import { convertFileToBase64 } from './services/pdf';
import { analyzeWithGemini } from './services/gemini';

function App() {
  const [analyzing, setAnalyzing] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const processFile = async (uploadedFile) => {
    if (!uploadedFile) return;

    setAnalyzing(true);
    setError(null);
    setData(null);

    try {
      console.log("Converting PDF to Base64...");
      const base64Data = await convertFileToBase64(uploadedFile);

      if (!base64Data) {
        throw new Error("No se pudo procesar el archivo PDF.");
      }

      console.log("Analyzing with Gemini 2.0 Multimodal...");
      const result = await analyzeWithGemini(null, base64Data);
      setData(result);

    } catch (err) {
      console.error(err);
      setError(err.message || "Error durante el análisis.");
      setData(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setData(null);
    setError(null);
  };

  return (
    <div className="app-container">
      <Header data={data} />
      <MainContent
        data={data}
        analyzing={analyzing}
        error={error}
        onFileUpload={processFile}
        onReset={handleReset}
      />
      <Footer />
    </div>
  );
}

export default App;
