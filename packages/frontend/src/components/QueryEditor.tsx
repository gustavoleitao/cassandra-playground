import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { sql } from '@codemirror/lang-sql';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { oneDark } from '@codemirror/theme-one-dark';

export interface QueryEditorRef {
  getValue: () => string;
  setValue: (value: string) => void;
}

interface Props {
  onExecute: (cql: string) => void;
}

export const QueryEditor = forwardRef<QueryEditorRef, Props>(({ onExecute }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useImperativeHandle(ref, () => ({
    getValue: () => viewRef.current?.state.doc.toString() ?? '',
    setValue: (value: string) => {
      const view = viewRef.current;
      if (!view) return;
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: value },
      });
    },
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    const executeKeymap = keymap.of([
      {
        key: 'Ctrl-Enter',
        mac: 'Cmd-Enter',
        run: (view) => {
          onExecute(view.state.doc.toString());
          return true;
        },
      },
    ]);

    const state = EditorState.create({
      doc: 'SELECT * FROM system.local;',
      extensions: [
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        executeKeymap,
        sql(),
        oneDark,
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="query-editor-wrapper">
      <div ref={containerRef} className="codemirror-container" />
      <div className="editor-toolbar">
        <button
          className="btn-execute"
          onClick={() => onExecute(viewRef.current?.state.doc.toString() ?? '')}
        >
          ▶ Execute
        </button>
        <span className="shortcut-hint">Ctrl+Enter</span>
      </div>
    </div>
  );
});

QueryEditor.displayName = 'QueryEditor';
