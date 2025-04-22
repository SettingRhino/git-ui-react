import type { ReactDiffViewerStylesOverride } from 'react-diff-viewer-continued';
import type { CodeDiffAdded, CodeDiffChanged, CodeViewData } from './type.ts';
import { useEffect, useMemo, useState } from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import { lineNumbers } from '@codemirror/view';
import CodeMirror from '@uiw/react-codemirror';
import { IconAdded, IconClosed, IconError, IconHunk, IconInline, IconLoading, IconPage, IconSplit } from '../common/svgs';
import { DiffViewMode, FileMode } from './constant.ts';
import { parseGitDiff } from './utils.tsx';

const diffViewerStyles: ReactDiffViewerStylesOverride = {
  diffContainer: {
    'tr': {
      height: '20px',
    },
    '& td': {
      padding: '0 !important',
    },
    '& th': {
      padding: '0 !important',
    },
    'pre': {
      padding: '0 !important',
      lineHeight: '20px',
    },
    'span': {
      padding: '0 !important',
    },
  },
  line: {
    border: 'none !important',
  },
  gutter: {
    minWidth: '30px !important',
    maxWidth: '50px !important',
    textAlign: 'center !important' as any,
  },
  marker: {
    minWidth: '20px !important',
    maxWidth: '30px !important',
    padding: '10px !important',
    textAlign: 'center !important' as any,
  },
};

type DiffViewModeValue = typeof DiffViewMode[keyof typeof DiffViewMode];

type FileModeValue = typeof FileMode[keyof typeof FileMode];

type CodeDiffModeHeadType = {
  actions: {
    view?: {
      viewMode: DiffViewModeValue;
      handleViewMode: (mode: DiffViewModeValue) => void;
    };
    file?: {
      fileMode: FileModeValue;
      handleFileMode: (mode: FileModeValue) => void;
    };
  };
  handleClose?: () => void;
};

const CodeDiffModeHead = ({ actions: { view, file }, handleClose }: CodeDiffModeHeadType) => {
  return (
    <div className="code-diff-header">
      <div className="code-diff-header-items">
        {file && (
          <div className="code-diff-modes">
            <div className={`mode-item ${file?.fileMode === FileMode.Hunk ? 'active' : ''}`} onClick={() => { file?.handleFileMode(FileMode.Hunk); }}>
              <IconHunk className="icon-item"/>
              Hunk
            </div>
            <div className={`mode-item ${file?.fileMode === FileMode.Original ? 'active' : ''}`} onClick={() => { file?.handleFileMode(FileMode.Original); }}>
              <IconPage className="icon-item"/>
              Original
            </div>
          </div>
        )}
        {view && (
          <div className="code-diff-modes">
            <div className={`mode-item ${view.viewMode === DiffViewMode.Inline ? 'active' : ''}`} onClick={() => { view.handleViewMode(DiffViewMode.Inline); }}>
              <IconInline className="icon-item"/>
              Inline
            </div>
            <div className={`mode-item ${view.viewMode === DiffViewMode.Split ? 'active' : ''}`} onClick={() => { view.handleViewMode(DiffViewMode.Split); }}>
              <IconSplit className="icon-item"/>
              Split
            </div>
            <div className={`mode-item ${view.viewMode === DiffViewMode.File ? 'active' : ''}`} onClick={() => { view.handleViewMode(DiffViewMode.File); }}>
              <IconPage className="icon-item"/>
              File
            </div>
          </div>
        )}
      </div>
      {handleClose && (<IconClosed className="code-diff-icon icon-item" onClick={handleClose} />)}
    </div>
  );
};

type CodeDiffBody = {
  viewMode: DiffViewModeValue;
  codeViewData: CodeViewData;
};

const CodeDiffBody = ({ viewMode, codeViewData }: CodeDiffBody) => {
  if (codeViewData.isLoading) {
    return (
      <div className="code-diff-code">
        <div className="status-wrapper">
          <IconLoading className="status-icon icon-item" />
        </div>

      </div>
    );
  }
  if (codeViewData.isError) {
    return (
      <div className="code-diff-code">
        <div className="status-wrapper">
          <IconError className="status-icon icon-item" />
        </div>
      </div>
    );
  }
  return (
    <>
      {viewMode !== DiffViewMode.File ? (
        <div className="code-diff-code">
          <ReactDiffViewer
            compareMethod={DiffMethod.LINES}
            hideLineNumbers={false}
            linesOffset={codeViewData?.data?.offset || 0}
            newValue={codeViewData?.data?.newValue || ''}
            oldValue={codeViewData?.data?.oldValue || ''}
            splitView={viewMode === DiffViewMode.Split}
            styles={diffViewerStyles} />
        </div>
      ) : (
        <div className="code-diff-code single-code-diff">
          <CodeMirror
            readOnly
            autoFocus={false}
            value={codeViewData?.data?.newValue || ''}
            basicSetup={{
              highlightActiveLineGutter: false,
              highlightActiveLine: false,
            }}
            extensions={[
              lineNumbers({
                formatNumber: (n: number) => {
                  return (n + (codeViewData?.data?.offset || 0)).toString();
                },
              }),
            ]} />
        </div>
      )}
    </>
  );
};

export const CodeView = ({ diff = '', handleClose, getOriginFile }: CodeDiffChanged) => {
  // const data = parseGitDiff(diff);
  const [viewMode, setViewMode] = useState<DiffViewModeValue>(DiffViewMode.Inline);
  const handleViewMode = (viewMode: DiffViewModeValue) => {
    setViewMode(viewMode);
  };

  const [fileMode, setFileMode] = useState<FileModeValue>(FileMode.Hunk);
  const handleFileMode = (fileMode: FileModeValue) => {
    setFileMode(fileMode);
  };
  const [rawFile, setRawFile] = useState<CodeViewData>({ isLoading: true, isError: false });

  useEffect(() => {
    setRawFile({ isLoading: true, isError: false });
    if (!!getOriginFile && fileMode === FileMode.Original) {
      getOriginFile().then((res) => {
        if (res) {
          const data = { newValue: res?.newValue || '', oldValue: res?.oldValue || '', offset: 0 };
          setRawFile({ isLoading: false, isError: false, data });
        } else {
          setRawFile({ isLoading: false, isError: true });
        }
      }).catch(() => {
        setRawFile({ isLoading: false, isError: true });
      });
    }
  }, [getOriginFile, fileMode]);

  const diffData = useMemo<CodeViewData>(() => {
    if (fileMode === FileMode.Hunk) {
      const parseDiff = parseGitDiff(diff);
      if (parseDiff) {
        return {
          isLoading: false,
          isError: false,
          data: {
            newValue: parseDiff?.change,
            oldValue: parseDiff?.origin,
            offset: parseDiff?.lineOffset,
          },
        };
      } else {
        // error
        return {
          isLoading: false,
          isError: false,
        };
      }
    } else {
      return rawFile;
    }
  }, [diff, fileMode, rawFile]);

  return (
    <div className="code-diff-wrap">
      <CodeDiffModeHead actions={{ view: { viewMode, handleViewMode }, file: getOriginFile ? { fileMode, handleFileMode } : undefined }} handleClose={handleClose} />
      <CodeDiffBody codeViewData={diffData} viewMode={viewMode} />
    </div>
  );
};

export const CodeSingleView = ({ diff = '', handleClose, title = 'New File', getOriginFile }: CodeDiffAdded) => {
  const [fileMode, setFileMode] = useState<FileModeValue>(FileMode.Hunk);
  const handleFileMode = (fileMode: FileModeValue) => {
    setFileMode(fileMode);
  };
  const [rawFile, setRawFile] = useState<CodeViewData>({ isLoading: true, isError: false });
  useEffect(() => {
    setRawFile({ isLoading: true, isError: false });
    if (!!getOriginFile && fileMode === FileMode.Original) {
      getOriginFile().then((res) => {
        if (res || res === '') {
          const data = { newValue: res || '', oldValue: '', offset: 0 };
          setRawFile({ isLoading: false, isError: false, data });
        } else {
          setRawFile({ isLoading: false, isError: true });
        }
      }).catch(() => {
        setRawFile({ isLoading: false, isError: true });
      });
    }
  }, [getOriginFile, fileMode]);

  const diffData = useMemo<CodeViewData>(() => {
    if (fileMode === FileMode.Hunk) {
      const parseDiff = parseGitDiff(diff);
      if (parseDiff) {
        return {
          isLoading: false,
          isError: false,
          data: {
            newValue: parseDiff?.change,
            oldValue: '',
            offset: parseDiff?.lineOffset,
          },
        };
      } else {
        // error
        return {
          isLoading: false,
          isError: false,
        };
      }
    } else {
      return rawFile;
    }
  }, [diff, fileMode, rawFile]);
  return (
    <div className="code-diff-wrap">
      <div className="code-diff-header">
        <div className="code-diff-header-title">
          <IconAdded className="added" />
          {title}
        </div>
        <IconClosed className="code-diff-icon" onClick={handleClose} />
      </div>
      {getOriginFile && (<CodeDiffModeHead actions={{ file: { fileMode, handleFileMode } }} />)}
      <CodeDiffBody codeViewData={diffData} viewMode={DiffViewMode.File} />
    </div>
  );
};
