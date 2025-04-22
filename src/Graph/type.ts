export type Commit = {
  id: string;
  short_id?: string;
  created_at: string;
  parent_ids: string[];
  title: string;
  message: string;
  author_name?: string;
  author_email?: string;
  authored_date?: string;
  committer_name?: string;
  committer_email?: string;
  committed_date: string;
  trailers?: Record<string, unknown>;
  extended_trailers?: Record<string, unknown>;
  web_url?: string;
};

export type ChildCommit = {
  commit: Commit;
  // 부모의 직계인지 -> 병합 commit인 경우, 이 커밋이 부모의 branch의 기준
  //        __()__
  //       /      |
  //  부모 ()------() 직계
  // null 판단불가 commit을  1, 2 번과 같이 그냥 분기만 된 경우 브런치에 따라 직계가 다를 수 있음
  // 3번 에 브런치만 그려질 경우 1번은 3번의 직계임
  //        __(1)__(3)__
  //       /            |
  //  부모 ()----(2)----(4)
  isMergeDirect: boolean | null;
};

/**
 * 브랜치 정보
 */
export type Branch = {
  name: string;
  commit: Commit;
  merged?: boolean;
  protected?: boolean;
  developers_can_push?: boolean;
  developers_can_merge?: boolean;
  can_push?: boolean;
  default?: boolean;
  web_url?: string;
};

/**
 * 태그 정보
 */
export type Tag = {
  name: string;
  message: string;
  target?: string;
  commit: Commit;
  release?: any | null;
  protected?: boolean;
  created_at: string | null;
};

export type BranchCommits = {
  branch: Branch;
  commits: Commit[];
};

export type CommitAction = {
  onMessageClick?: (commit: Commit) => void;
  onDotClick?: (commit: Commit) => void;
};

export type GraphUtil = {
  focusCommitID?: string;
};

export type GitGraphState = {
  isLoading?: boolean;
  gitData?: {
    tags: Tag[];
    branchCommits: BranchCommits[];
    selectedBranchName?: string;
  };
};

export type GitGraphType = {
  className?: string;
  commitAction?: CommitAction;
  graphUtil?: GraphUtil;
} & GitGraphState;
