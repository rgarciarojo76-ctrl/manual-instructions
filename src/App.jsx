import { useState } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import MainContent from './components/MainContent';
import './styles/global.css';
import { extractTextFromPDF } from './services/pdf';
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
      console.log("Extracting text...");
      const { fullText } = await extractTextFromPDF(uploadedFile);

      if (!fullText || fullText.length < 50) {
        throw new Error("No se pudo extraer texto suficiente del PDF.");
      }

      console.log("Analyzing with Gemini via Proxy...");
      const result = await analyzeWithGemini(null, fullText);
      setData(result);

    } catch (err) {
      console.error(err);
      setError(err.message || "Error durante el análisis.");
      setData(null);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="app-container">
      <Header data={data} />
      <MainContent
        data={data}
        analyzing={analyzing}
        error={error}
        onFileUpload={processFile}
      />
      <Footer />
    </div>
  );
}

export default App;
