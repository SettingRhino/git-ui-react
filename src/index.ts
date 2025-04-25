import { GitUI } from './GitUI.tsx'
import { useGetGitGraph } from './hooks.ts'

//commons - type
import type  { Branch, Commit, Tag, GitDiff } from './common/type.ts';

//Graph
import { GitGraph } from './Graph'
import type { CommitAction, GitGraphState, GitGraphType, GraphUtil, BranchCommits } from './Graph'

//CodeDiff
import { CodeDiff, convertDiffSetting } from "./CodeDiff";
import type { CodeDiffAdded, CodeDiffAlertLabel, CodeDiffChanged, CodeDiffType, CodeDiffUnknownLabel, ConvertDiffSettingType } from './CodeDiff'

//CommitView
import { CommitFileView, GitChangeEvent } from './CommitFileView'
import type { CommitFileViewState, CommitFileViewType } from './CommitFileView'

//CommitView
import { CommitView, convertCommitView } from './CommitView'
import type { CommitViewType } from './CommitView'

//tranform
import {
    transformGithubCommitToCommit,
    transformGitHubV3PatchMultiFileDiff,
    transformGitHubBranchCommits,
    transformGitHubTagToCommit,
    transformGithubBranchToBranch,
    gitContentBase64Decode
} from './tranform/github.ts'
import {
    transformGiteaCommitToCommit,
    transformGitHubBranchCommitsAndTags,
    transformGiteaV3PatchMultiFileDiff,
} from './tranform/gitea.ts'
import type { GitHubTagResponse, GitHubBranchResponse,GitHubCommitResponse, GitHubBranchCommits } from './tranform/github.ts'
import type { GiteaTagResponse, GiteaBranchResponse,GiteaCommitResponse, GiteaBranchCommits } from './tranform/gitea.ts'

export type {
    Branch, BranchCommits, Commit, Tag, GitDiff,
    CommitAction, GitGraphState, GitGraphType, GraphUtil,
    CodeDiffAdded, CodeDiffAlertLabel, CodeDiffChanged, CodeDiffType, CodeDiffUnknownLabel, ConvertDiffSettingType,
    CommitFileViewState, CommitFileViewType,
    CommitViewType,
    GitHubTagResponse, GitHubBranchResponse,GitHubCommitResponse, GitHubBranchCommits,
    GiteaTagResponse, GiteaBranchResponse,GiteaCommitResponse, GiteaBranchCommits
}

export  {
    GitUI, useGetGitGraph,
    GitGraph,
    CodeDiff, convertDiffSetting,
    CommitFileView, GitChangeEvent,
    CommitView, convertCommitView,
    transformGithubCommitToCommit,
    transformGitHubV3PatchMultiFileDiff,
    transformGitHubBranchCommits,
    transformGitHubTagToCommit,
    transformGithubBranchToBranch,
    gitContentBase64Decode,
    transformGiteaCommitToCommit,
    transformGitHubBranchCommitsAndTags,
    transformGiteaV3PatchMultiFileDiff,
}