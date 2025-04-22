import type { CodeDiffType } from './CodeDiff';
import type { CommitFileViewState, CommitFileViewType, GitDiff } from './CommitFileView';
import type { CommitViewType } from './CommitView';
import {BranchCommits, Commit, CommitAction, GitGraphState, GitGraphType, GraphUtil} from './Graph';
import { useEffect, useMemo, useState } from 'react';
import { convertDiffSetting } from './CodeDiff';
import { convertCommitView } from './CommitView';

const initGraphData = { gitData: { tags: [], branchCommits: [] }, isLoading: true };
const initFileViewData = { diffs: [], isLoading: true, isError: false };

export type GitUIType = {
  gitGraph: GitGraphType;
  commitView: CommitViewType;
  commitFileView: CommitFileViewType;
  codeDiff: CodeDiffType;
  panel: {
    left: {
      full: boolean;
      graph: boolean;
    };
    right: {
      active: boolean;
    };
  };
};

export type GitGraphProps = { gitGraph?: {
  graphState?: GitGraphState;
  graphUtil?: GraphUtil;
  commitAction?: CommitAction;
};
commitView?: CommitViewType;
commitFileView: {
  getDiffs: (commitId: string) => Promise<GitDiff[] | null | undefined>;
};
codeDiffView: {
  getOriginFile?: (commitId: string, path: string) => Promise<string | null | undefined>;
}; };

export type GitUIHookReturn = {
  state: { selectedCommit?: Commit };
  ui: GitUIType;
};

export const useGetGitGraph = ({ gitGraph = { graphState: initGraphData }, commitView, commitFileView, codeDiffView }: GitGraphProps): GitUIHookReturn => {
  // Graph Data
  // const [gState, setGState] = useState<any>(graphState); //
  // 선택 Commit
  // selectedCommit return
  const [selectedCommit, setSelectedCommit] = useState<Commit | undefined>(undefined);
  useEffect(() => {
    setSelectedCommit(undefined);
  }, [gitGraph?.graphState]);
  const handleDotClick = (c: Commit) => {
    setSelectedCommit(c);
    if (gitGraph?.commitAction?.onDotClick) {
      gitGraph?.commitAction?.onDotClick(c);
    }
  };
  const handleMessageClick = (c: Commit) => {
    setSelectedCommit(c);
    if (gitGraph?.commitAction?.onMessageClick) {
      gitGraph?.commitAction?.onMessageClick(c);
    }
  };

  const allCommitMap = useMemo(() => {
    const branchesCommits = gitGraph?.graphState?.gitData?.branchCommits || [];
    const commitMap = new Map<string, Commit>();
    branchesCommits.forEach((branchCommits: BranchCommits) => {
      const commitByBranchCommits = branchCommits.commits || [];
      for (const branchCommit of commitByBranchCommits) {
        const commitID = branchCommit.id;
        if (commitID) {
          const commit = commitMap.get(commitID);
          if (!commit) {
            commitMap.set(commitID, branchCommit);
          }
        }
      }
    });
    return commitMap;
  }, [gitGraph?.graphState]);

  // CommitView
  const commitViewData = useMemo(() => {
    if (commitView?.data) {
      return commitView.data;
    } else {
      return (selectedCommit) && convertCommitView(selectedCommit, (commitID: string) => {
        const targetCommit = allCommitMap.get(commitID);
        if (targetCommit) {
          setSelectedCommit(targetCommit);
        }
      });
    }
  }, [selectedCommit, allCommitMap]);

  const [fileDiffsState, setFileDiffsState] = useState<CommitFileViewState>({ diffs: [], isLoading: false, isError: false });

  useEffect(() => {
    setFileDiffsState(initFileViewData);
    if (selectedCommit) {
      commitFileView.getDiffs(selectedCommit.id).then((res) => {
        if (res) {
          setFileDiffsState({ isLoading: false, diffs: res, isError: false });
        } else {
          setFileDiffsState({ isLoading: false, diffs: [], isError: true });
        }
      }).catch(() => {
        setFileDiffsState({ isLoading: false, diffs: [], isError: true });
      });
    }
  }, [selectedCommit]);

  const [selectedDiff, setSelectedDiff] = useState<GitDiff | null>();
  const diffSetting = useMemo(() => {
    if (selectedDiff) {
      return convertDiffSetting(selectedCommit, selectedDiff, () => setSelectedDiff(null), codeDiffView.getOriginFile);
    }
    return undefined;
  }, [selectedDiff, selectedCommit, codeDiffView.getOriginFile]);

  const panel = useMemo(() => {
    return {
      left: {
        full: !selectedCommit,
        graph: !selectedDiff,
      },
      right: {
        active: !!selectedCommit,
      },
    };
  }, [selectedCommit, selectedDiff]);
  return {
    state: { selectedCommit },
    ui: {
      gitGraph: {
        ...gitGraph?.graphState,
        graphUtil: gitGraph?.graphUtil ? gitGraph?.graphUtil : { focusCommitID: selectedCommit?.id },
        commitAction: {
          onDotClick: handleDotClick,
          onMessageClick: handleMessageClick,
        },
      },
      commitView: {
        data: commitViewData,
        classes: commitView?.classes,
      },
      commitFileView: {
        ...fileDiffsState,
        handlePathClick: setSelectedDiff,
      },
      codeDiff: {
        diffSetting: diffSetting,
      },
      panel,
    },
  };
};
