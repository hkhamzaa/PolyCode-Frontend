import React from 'react';
import { useSearchParams } from 'react-router-dom';
import CodePlayground from '../components/CodePlayground';
import './PlaygroundPage.css';

const BROWSER_LANGS = [
  { lang: 'javascript', icon: '🟨', label: 'JS', note: 'Sandbox' },
  { lang: 'typescript', icon: '🔷', label: 'TS', note: 'Babel' },
  { lang: 'python', icon: '🐍', label: 'Python', note: 'Pyodide' },
  { lang: 'html', icon: '🌐', label: 'HTML', note: 'Preview' },
  { lang: 'css', icon: '🎨', label: 'CSS', note: 'Preview' },
  { lang: 'sql', icon: '🗄️', label: 'SQL', note: 'SQLite' },
  { lang: 'json', icon: '📦', label: 'JSON', note: 'Lint' },
  { lang: 'xml', icon: '📋', label: 'XML', note: 'Parse' },
  { lang: 'markdown', icon: '📝', label: 'Markdown', note: 'Render' },
  { lang: 'brainfuck', icon: '🧠', label: 'Brainfuck', note: 'Esoteric' },
  { lang: 'regex', icon: '🔍', label: 'Regex', note: 'Tester' },
];

export default function PlaygroundPage({ onToggleSidebar, sidebarOpen }) {
  const [searchParams] = useSearchParams();
  const initLang = searchParams.get('lang') || 'javascript';
  const initCode = searchParams.get('code')
    ? decodeURIComponent(searchParams.get('code'))
    : undefined;

  return (
    <div className="playground-page">
      <div className="playground-page-header">
        <div className="pph-top">
          <h1><span className="pph-icon">⬡</span> Code Playground</h1>
          <p className="pph-sub">
            Write &amp; run code entirely in your browser — no server, no API key.
          </p>
        </div>
        <div className="pph-pills">
          {BROWSER_LANGS.map(({ lang, icon, label, note }) => (
            <a
              key={lang}
              className={`pph-pill ${initLang === lang ? 'active' : ''}`}
              href={`/playground?lang=${lang}`}
            >
              {icon} {label}
              <span className="pph-note">{note}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="playground-page-body">
        <CodePlayground
          initialLanguage={initLang}
          initialCode={initCode}
          onToggleSidebar={onToggleSidebar}
          sidebarOpen={sidebarOpen}
        />
      </div>
    </div>
  );
}