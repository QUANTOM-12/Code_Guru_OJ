import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ language = 'javascript', theme = 'vs-dark', height = '400px', value = '', onChange, onMount }) => {
  const [code, setCode] = useState(value);
  const editorRef = useRef(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  useEffect(() => {
    setCode(value);
  }, [value]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    setIsEditorReady(true);
    
    // Fix cursor and focus issues
    editor.focus();
    
    // Trigger layout update to fix positioning
    setTimeout(() => {
      editor.layout();
    }, 100);

    // Call parent onMount if provided
    if (onMount) {
      onMount(editor, monaco);
    }

    // Configure editor options to fix cursor issues
    editor.updateOptions({
      selectOnLineNumbers: true,
      roundedSelection: false,
      readOnly: false,
      cursorStyle: 'line',
      automaticLayout: true,
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      minimap: { enabled: false },
      fontSize: 14,
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
    });
  };

  const handleEditorChange = (newValue) => {
    setCode(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const editorOptions = {
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: false,
    cursorStyle: 'line',
    automaticLayout: true,
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    minimap: { enabled: false },
    fontSize: 14,
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
    lineNumbers: 'on',
    glyphMargin: false,
    folding: false,
    lineDecorationsWidth: 0,
    lineNumbersMinChars: 3,
    renderLineHighlight: 'line',
    theme: theme
  };

  return (
    <div 
      style={{
        textAlign: 'left',
        height: height, 
        width: '100%',
        border: '1px solid #d0d7de',
        borderRadius: '6px',
        overflow: 'hidden'
      }}
    >
      <Editor
        height={height}
        language={language}
        theme={theme}
        value={code}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={editorOptions}
        loading={<div>Loading editor...</div>}
      />
    </div>
  );
};

export default CodeEditor;