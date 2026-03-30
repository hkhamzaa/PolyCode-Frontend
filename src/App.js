import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LanguageSelectPage from './pages/LanguageSelectPage';
import HomePage from './pages/HomePage';
import DocumentPage from './pages/DocumentPage';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
import PlaygroundPage from './pages/PlaygroundPage';
import { PlaygroundProvider } from './context/PlaygroundContext';
import './App.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [selectedLanguage, setSelectedLanguage] = React.useState(
    () => localStorage.getItem('selectedLanguage') || null
  );

  const toggleSidebar = () => setIsSidebarOpen(o => !o);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLanguageSelect = (language) => {
    localStorage.setItem('selectedLanguage', language);
    setSelectedLanguage(language);
  };

  return (
    <PlaygroundProvider>
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
                    {/* Playground — passes sidebar controls so hamburger works inside IDE */}
                    <Route path="/playground" element={
                      <PlaygroundPage
                        onToggleSidebar={toggleSidebar}
                        sidebarOpen={isSidebarOpen}
                      />}
                    />
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
    </PlaygroundProvider>
  );
}

export default App;