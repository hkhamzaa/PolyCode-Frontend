import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import { runPythonCode } from '../utils/api';

const PlaygroundContext = createContext(null);

export function PlaygroundProvider({ children }) {
  const pyodideRef = useRef(null);
  const [pyodideStatus, setPyodideStatus] = useState('idle'); // idle | loading | ready | error
  const [pyodideError, setPyodideError] = useState(null);

  const loadPyodide = useCallback(async () => {
    if (pyodideRef.current) return pyodideRef.current;
    if (pyodideStatus === 'loading') return null;

    setPyodideStatus('loading');
    try {
      if (!window.loadPyodide) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
          script.onload = resolve;
          script.onerror = () => reject(new Error('Failed to load Pyodide'));
          document.head.appendChild(script);
        });
      }
      const pyodide = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/',
      });
      pyodide.runPython(`
import sys, io
class _Cap(io.StringIO): pass
sys.stdout = _Cap()
sys.stderr = _Cap()
      `);
      pyodideRef.current = pyodide;
      setPyodideStatus('ready');
      return pyodide;
    } catch (e) {
      setPyodideError(e.message);
      setPyodideStatus('error');
      return null;
    }
  }, [pyodideStatus]);

  const runPython = useCallback(async (code, stdin = '') => {
    // Prefer server Python for full compatibility with project examples.
    // Fallback to Pyodide when backend execution is unavailable.
    try {
      return await runPythonCode(code, stdin);
    } catch (_) {
      const py = await loadPyodide();
      if (!py) throw new Error('Python runtime not available');
      py.runPython('sys.stdout = _Cap()\nsys.stderr = _Cap()');
      let error = null;
      try { py.runPython(code); } catch (e) { error = e.message; }
      const stdout = py.runPython('sys.stdout.getvalue()');
      const stderr = py.runPython('sys.stderr.getvalue()');
      return { stdout, stderr, error };
    }
  }, [loadPyodide]);

  return (
    <PlaygroundContext.Provider value={{ pyodideStatus, pyodideError, loadPyodide, runPython }}>
      {children}
    </PlaygroundContext.Provider>
  );
}

export function usePlayground() {
  const ctx = useContext(PlaygroundContext);
  if (!ctx) throw new Error('usePlayground must be inside PlaygroundProvider');
  return ctx;
}