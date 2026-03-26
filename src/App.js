import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LanguageSelectPage from './pages/LanguageSelectPage';
import HomePage from './pages/HomePage';
import DocumentPage from './pages/DocumentPage';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
import './App.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [selectedLanguage, setSelectedLanguage] = React.useState(null);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLanguageSelect = (language) => {
    localStorage.setItem('selectedLanguage', language);
    setSelectedLanguage(language);
  };

  return (
    <Router>
      <div className="app">
        {selectedLanguage ? (
          <>
            <Navbar toggleSidebar={toggleSidebar} />
            <div className="layout">
              {isSidebarOpen && <div className="backdrop" onClick={closeSidebar}></div>}
              <Sidebar 
                isOpen={isSidebarOpen} 
                onClose={closeSidebar} 
                selectedLanguage={selectedLanguage} 
                onLanguageSelect={handleLanguageSelect} 
              />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<HomePage selectedLanguage={selectedLanguage} />} />
                  <Route path="/hub" element={<HomePage selectedLanguage={selectedLanguage} />} />
                  <Route path="/doc/*" element={<DocumentPage selectedLanguage={selectedLanguage} />} />
                  <Route path="/category/*" element={<CategoryPage selectedLanguage={selectedLanguage} />} />
                  <Route path="/search" element={<SearchPage selectedLanguage={selectedLanguage} />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </main>
            </div>
          </>
        ) : (
          <Routes>
            <Route path="/" element={<LanguageSelectPage onLanguageSelect={handleLanguageSelect} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}


export default App;
