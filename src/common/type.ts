type Commit = {
    id: string;
    created_at: string;
    parent_ids: string[];
    title?: string;
    message: string;
    author_name?: string;
    author_email?: string;
    authored_date?: string;
    committer_name?: string;
    committer_email?: string;
    committed_date: string;
};

/**
 * 브랜치 정보
 */
type Branch = {
    name: string;
    commit: Commit;
    protected?: boolean;
    default?: boolean;
};

/**
 * 태그 정보
 */
type Tag = {
    name: string;
    message?: string;
    target?: string;
    commit: Commit;
    release?: any | null;
    protected?: boolean;
    created_at?: string | null;
};

type GitDiff = {
    diff?: string;
    new_path: string;
    old_path: string;
    a_mode: string;
    b_mode: string;
    new_file: boolean;
    renamed_file: boolean;
    deleted_file: boolean;
};



export type { Branch, Commit, GitDiff, Tag };
