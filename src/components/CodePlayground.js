import React, { useState, useRef, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { usePlayground } from '../context/PlaygroundContext';
import { executeCode, resolveEngine } from '../utils/BrowserExecutor';
import { STARTERS } from '../constants/playgroundStarters';
import './CodePlayground.css';

// ── Language selector groups ──────────────────────────────────────────────────

const LANG_GROUPS = [
  {
    label: '✓ Browser',
    langs: ['javascript', 'typescript', 'python', 'html', 'css', 'sql', 'json', 'xml', 'markdown', 'brainfuck', 'regex', 'php'],
  },
  {
    label: '⚠ Server',
    langs: ['c', 'cpp', 'java', 'go', 'rust', 'ruby', 'bash', 'kotlin', 'swift', 'csharp', 'r', 'lua', 'powershell', 'batch', 'dart', 'perl', 'scala'],
  },
];

// ── Main component ────────────────────────────────────────────────────────────

export default function CodePlayground({ initialCode, initialLanguage = 'javascript', onToggleSidebar, sidebarOpen }) {
  const getStarter = useCallback((lang) => STARTERS[lang] || '// Start coding here\n', []);
  const [language, setLanguage] = useState(initialLanguage);
  const [code, setCode] = useState(initialCode || getStarter(initialLanguage));
  const [output, setOutput] = useState([]);
  const [previewHTML, setPreview] = useState(null);
  const [stdin, setStdin] = useState('');
  const [running, setRunning] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState(false);
  const outputRef = useRef(null);

  const { runPython } = usePlayground();

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [output]);

  const handleLangChange = (lang) => {
    setLanguage(lang);
    setCode(getStarter(lang));
    setOutput([]);
    setPreview(null);
  };

  const handleRun = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setOutput([{ type: 'system', text: `▶ Running ${resolveEngine(language).label}…` }]);
    setPreview(null);

    const t0 = performance.now();
    try {
      const result = await executeCode(code, language, runPython, stdin);
      const ms = ((performance.now() - t0) / 1000).toFixed(2);

      if (result.previewHTML) {
        setPreview(result.previewHTML);
        setOutput([{ type: 'system', text: `✓ Rendered in ${ms}s` }]);
      } else {
        const lines = [{ type: 'system', text: `✓ Done in ${ms}s` }];
        if (result.stdout) lines.push({ type: 'stdout', text: result.stdout });
        if (result.stderr) lines.push({ type: 'stderr', text: result.stderr });
        if (result.error) lines.push({ type: 'stderr', text: result.error });
        if (!result.stdout && !result.stderr && !result.error)
          lines.push({ type: 'stdout', text: '(no output)' });
        setOutput(lines);
      }
    } catch (e) {
      setOutput([{ type: 'stderr', text: e.message }]);
    } finally {
      setRunning(false);
    }
  }, [code, language, running, runPython, stdin]);

  const handleEditorKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); handleRun(); }
  }, [handleRun]);

  const langInfo = resolveEngine(language);
  const isUnsupported = langInfo.engine === 'server';
  const hasPreview = previewHTML !== null;
  const [activeTab, setActiveTab] = useState('output');

  return (
    <div className="playground-root">
      {/* ── Toolbar ── */}
      <div className="pg-toolbar">
        <div className="pg-toolbar-left">
          {/* Hamburger — re-open sidebar */}
          {onToggleSidebar && (
            <button
              className="pg-hamburger"
              onClick={onToggleSidebar}
              title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              aria-label="Toggle sidebar"
            >
              <span /><span /><span />
            </button>
          )}

          <span className="pg-logo">⬡ IDE</span>

          {/* Language selector */}
          <select
            className="pg-lang-select"
            value={language}
            onChange={e => handleLangChange(e.target.value)}
          >
            {LANG_GROUPS.map(group => (
              <optgroup key={group.label} label={group.label}>
                {group.langs.map(l => {
                  const info = resolveEngine(l);
                  return <option key={l} value={l}>{info.icon} {info.label}</option>;
                })}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="pg-toolbar-center">
          {isUnsupported
            ? <span className="pg-server-badge">⚠ Requires server runtime</span>
            : <span className="pg-browser-badge">✓ Runs in browser</span>}
        </div>

        <div className="pg-toolbar-right">
          <button className="pg-icon-btn" onClick={() => setFontSize(f => Math.max(10, f - 1))} title="Smaller font">A-</button>
          <span className="pg-font-size">{fontSize}px</span>
          <button className="pg-icon-btn" onClick={() => setFontSize(f => Math.min(24, f + 1))} title="Larger font">A+</button>
          <button className={`pg-icon-btn ${wordWrap ? 'active' : ''}`} onClick={() => setWordWrap(w => !w)} title="Word wrap">⇌</button>
          <button className="pg-icon-btn" onClick={() => { setCode(getStarter(language)); setOutput([]); setPreview(null); }} title="Reset">↺</button>
          <button
            className={`pg-run-btn ${running ? 'running' : ''} ${isUnsupported ? 'disabled' : ''}`}
            onClick={handleRun}
            disabled={running || isUnsupported}
            title="Run (Ctrl+Enter)"
          >
            {running ? <><span className="pg-spinner">⟳</span> Running…</> : <>▶ Run</>}
          </button>
        </div>
      </div>

      {/* ── Split panes ── */}
      <div className="pg-panes" onKeyDown={handleEditorKeyDown}>
        {/* Editor */}
        <div className="pg-editor-pane">
          <div className="pg-pane-header">
            <span className="pg-pane-title">{langInfo.icon} {langInfo.label}</span>
            <span className="pg-pane-hint">Ctrl+Enter to run</span>
          </div>
          {langInfo.engine === 'py' && (
            <div className="pg-stdin-wrap">
              <label htmlFor="pg-stdin" className="pg-stdin-label">stdin (one line per input)</label>
              <textarea
                id="pg-stdin"
                className="pg-stdin"
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder={'Example:\nAlice\n42'}
              />
            </div>
          )}
          <div className="pg-editor-body">
            <Editor
              height="100%"
              language={langInfo.mono}
              value={code}
              onChange={v => setCode(v || '')}
              theme="vs-dark"
              options={{
                fontSize,
                fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',monospace",
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: wordWrap ? 'on' : 'off',
                lineNumbers: 'on',
                renderLineHighlight: 'gutter',
                bracketPairColorization: { enabled: true },
                guides: { bracketPairs: true },
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                tabSize: 2,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
              }}
            />
          </div>
        </div>

        {/* Output / Preview — RIGHT side */}
        <div className="pg-output-pane">
          <div className="pg-pane-header">
            <div className="pg-output-tabs">
              <button className={`pg-tab ${activeTab === 'output' ? 'active' : ''}`} onClick={() => setActiveTab('output')}>⬡ Console</button>
              {hasPreview && (
                <button className={`pg-tab ${activeTab === 'preview' ? 'active' : ''}`} onClick={() => setActiveTab('preview')}>🌐 Preview</button>
              )}
            </div>
            <button className="pg-clear-btn" onClick={() => { setOutput([]); setPreview(null); }}>CLEAR</button>
          </div>

          <div className="pg-output-body" ref={outputRef}>
            {activeTab === 'output' && (
              <>
                {output.length === 0 ? (
                  <div className="pg-empty-state">
                    <span className="pg-empty-icon">▶</span>
                    <p>Hit <strong>Run</strong> or press <kbd>Ctrl+Enter</kbd></p>
                    {isUnsupported && (
                      <p className="pg-unsupported-note">
                        {langInfo.label} requires a server runtime.<br />
                        Select a browser-supported language above.
                      </p>
                    )}
                  </div>
                ) : (
                  output.map((line, i) => (
                    <pre key={i} className={`pg-line ${line.type}`}>{line.text}</pre>
                  ))
                )}
                {running && <div className="pg-loader"><span className="pg-pulse" /></div>}
              </>
            )}
            {activeTab === 'preview' && hasPreview && (
              <iframe className="pg-preview-frame" srcDoc={previewHTML} title="Preview" sandbox="allow-scripts" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}