// Monaco Editor 独立模块
window.MonacoEditor = {
  init: function(options = {}) {
    const { 
      containerId = 'monaco-editor', 
      code = '', 
      language = 'cpp',
      copySuccess = null 
    } = options;
    
    let editor = null;
    
    const initEditor = () => {
      if (typeof monaco !== 'undefined') {
        editor = monaco.editor.create(document.getElementById(containerId), {
          value: code,
          language: language,
          theme: 'vs-dark',
          fontSize: 14,
          lineNumbers: 'on',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true
        });
      }
    };
    
    const changeLanguage = (lang, newCode) => {
      if (editor) {
        editor.setValue(newCode || code);
        monaco.editor.setModelLanguage(editor.getModel(), lang);
      }
    };
    
    const getValue = () => {
      return editor ? editor.getValue() : '';
    };
    
    const setValue = (value) => {
      if (editor) {
        editor.setValue(value);
      }
    };
    
    const copyCode = async () => {
      if (editor) {
        const codeContent = editor.getValue();
        try {
          await navigator.clipboard.writeText(codeContent);
          if (copySuccess && typeof copySuccess === 'object' && 'value' in copySuccess) {
            copySuccess.value = true;
          } else if (typeof copySuccess !== 'undefined') {
            copySuccess = true;
          }
          setTimeout(() => {
            if (copySuccess && typeof copySuccess === 'object' && 'value' in copySuccess) {
              copySuccess.value = false;
            } else if (typeof copySuccess !== 'undefined') {
              copySuccess = false;
            }
          }, 2000);
        } catch (err) {
          console.error('复制失败:', err);
        }
      }
    };
    
    // 初始化
    if (typeof define === 'function' && define.amd) {
      require(['vs/editor/editor.main'], initEditor);
    } else {
      initEditor();
    }
    
    return {
      changeLanguage,
      getValue,
      setValue,
      copyCode
    };
  }
};
