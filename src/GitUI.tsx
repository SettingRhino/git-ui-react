import type { GitUIType } from './hooks.ts';
import { CodeDiff } from './CodeDiff';
import { CommitFileView } from './CommitFileView';
import { CommitView } from './CommitView';
import { GitGraph } from './Graph';
import './gitui.css';

// ?: { diffState?: CommitFileViewState };

export const GitUI = ({ gitGraph, commitView, commitFileView, codeDiff, panel }: GitUIType) => {
  return (
    <div className="git-ui">
      <div className={`left-panel ${panel?.left?.full ? 'full-view' : ''} ${panel?.left?.graph ? 'active' : 'none-active'}`}>
        <GitGraph
          {...gitGraph} />
      </div>
      <div className={`left-panel ${panel?.left?.full ? 'full-view' : ''} ${!panel?.left?.graph ? 'active' : 'none-active'}`}>
        <CodeDiff {...codeDiff} />
      </div>
      {panel?.right?.active && (
        <div className="right-panel">
          <CommitView {...commitView} />
          <CommitFileView {...commitFileView} />
        </div>
      )}
    </div>
  );
};
