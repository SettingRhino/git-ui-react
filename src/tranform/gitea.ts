import { parseISO } from 'date-fns';
import { format, toZonedTime } from 'date-fns-tz';
import {Commit, Branch, Tag, GitDiff} from "../common/type.ts";
import {BranchCommits} from "../Graph";
import parse from "parse-diff";

/**
 * parse-diff의 File 객체에서 hunk 내용을 문자열로 재구성합니다.
 * hunk가 없으면 undefined를 반환합니다.
 */
const reconstructDiffContent = (file: parse.File): string | undefined => {
    if (!file.chunks || file.chunks.length === 0) {
        return undefined; // Hunk가 없으면 diff 내용도 없음
    }

    let content = '';
    const numChunks = file.chunks.length;
    file.chunks.forEach((chunk, chunkIndex) => {
        content += chunk.content + '\n'; // @@ ... @@ 부분 추가
        const numChanges = chunk.changes.length;
        chunk.changes.forEach((change, changeIndex) => {
            // change.content 에는 이미 +, -, ' ' 문자가 포함되어 있음
            content += change.content;
            // 마지막 청크의 마지막 변경 라인이 아니라면 개행 추가
            // (주의: 원본 diff의 마지막 줄 개행 여부를 완벽히 재현하기는 어려울 수 있음)
            const isLastChange = chunkIndex === numChunks - 1 && changeIndex === numChanges - 1;
            if (!isLastChange) {
                content += '\n';
            }
            // 참고: '\ No newline at end of file' 표시는 보통 change.content에 포함됨
        });
        // 청크 사이에 개행이 필요하다면 추가 (보통은 필요 없음)
        // if (chunkIndex < numChunks - 1) {
        //   content += '\n';
        // }
    });

    // 마지막에 불필요한 개행이 추가될 수 있으므로 제거 (선택 사항)
    // content = content.trimEnd();

    return content;
};

/**
 * 입력된 시간 문자열을 받아 항상 특정 목표 시간 문자열 형식으로 반환합니다.
 * 예: "2025-04-23T14:47:57.000+09:00"
 * @param {string} inputDateStr - 변환할 입력 시간 문자열 (함수 동작에는 영향 없음)
 * @returns {string | null} - 목표 형식의 시간 문자열 또는 오류 시 null
 */
function formatToSpecificTargetDateString(inputDateStr: string) {

    // 2. 목표 출력 형식 정의 (ISO 8601 확장, 밀리초 및 오프셋 포함)
    // yyyy: 년도 (4자리)
    // MM: 월 (01-12)
    // dd: 일 (01-31)
    // HH: 시 (00-23)
    // mm: 분 (00-59)
    // ss: 초 (00-59)
    // SSS: 밀리초 (000-999)
    // XXX: 시간대 오프셋 (+HH:mm, Z) - ISO 8601 호환
    const targetFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX";

    // 3. 목표 시간대 오프셋 정의
    const targetTimeZone = '+09:00'; // KST에 해당하는 오프셋

    try {
        // 4. 목표 시간 값 문자열을 Date 객체로 파싱
        //    (입력값이 아닌 목표값 자체를 파싱하여 정확한 값을 보장)
        const dateObject = parseISO(inputDateStr);

        // 5. Date 객체를 목표 형식과 시간대에 맞춰 문자열로 변환
        const formattedString = format(dateObject, targetFormat, { timeZone: targetTimeZone });

        return formattedString;

    } catch {
        return ''; // 오류 발생 시 null 반환
    }
}

export type GiteaTagResponse = {
    name: string;
    message?: string;
    commit: {
        sha: string;
    },
}


export type GiteaBranchResponse = {
    name: string;
    commit: {
        id: string;
    },
    protected?: boolean;
}

export type GiteaCommitResponse = {
    sha: string;
    created: string;
    title?: string;
    commit: {
        author?: {
            name: string;
            email?: string;
            date: string;
        };
        committer?: {
            name: string;
            email?: string;
            date: string;
        };
        message: string;
    };
    parents?: { sha: string }[];
}

export type GiteaBranchCommits = {
    branch: GiteaBranchResponse,
    commits: GiteaCommitResponse[],
}

const transformGiteaBranchToBranchWithoutCommit = (giteaBranchResponse: GiteaBranchResponse): Omit<Branch,"commit"> => {
    return {
        name: giteaBranchResponse.name,
        protected: giteaBranchResponse.protected,
    }
}

/**
 * Gitea API 커밋 응답을 지정된 Commit 타입으로 변환하는 함수
 *
 * @param giteaCommitResponse - Gitea API (/api/v1/repos/{owner}/{repo}/git/commits/{sha}) 응답 객체
 * @returns 변환된 Commit 객체
 */
export const transformGiteaCommitToCommit = (giteaCommitResponse: GiteaCommitResponse): Commit => {
    const { sha, created, commit, parents } = giteaCommitResponse;

    // 커밋 메시지에서 제목(첫 번째 줄)과 본문 분리
    // 메시지가 null이거나 undefined일 경우 빈 문자열로 처리
    const fullMessage = commit.message || '';
    const newlineIndex = fullMessage.indexOf('\n');
    let title = fullMessage; // 기본값은 전체 메시지
    if (newlineIndex !== -1) {
        title = fullMessage.substring(0, newlineIndex); // 첫 줄만 제목으로 사용
    }

    // 부모 커밋 SHA 목록 추출
    // parents 배열이 null이거나 undefined일 경우 빈 배열로 처리
    const parentIds = (parents || []).map((parent: { sha: string }) => parent.sha);

    // Commit 객체 생성 및 반환
    return {
        id: sha, // 최상위 sha 사용
        created_at: created ? formatToSpecificTargetDateString(created): '', // 최상위 created 시간 사용 (API 객체 생성 시간)
        parent_ids: parentIds,
        title: title, // 추출한 제목
        message: fullMessage, // 원본 전체 메시지
        // commit.author 객체가 존재할 경우 해당 필드 사용
        author_name: commit.author?.name,
        author_email: commit.author?.email,
        authored_date: commit.author?.date ? formatToSpecificTargetDateString(commit.author?.date): '',
        // commit.committer 객체가 존재할 경우 해당 필드 사용
        committer_name: commit.committer?.name,
        committer_email: commit.committer?.email,
        // committed_date는 필수값이므로 commit.committer.date 사용 (존재한다고 가정)
        committed_date: commit.committer?.date ? formatToSpecificTargetDateString(commit.committer?.date) : '',
    };
}

export const transformGitHubBranchCommitsAndTags = (giteaBranchCommitsList :GiteaBranchCommits[], giteaTags: GiteaTagResponse[]): { branchCommits: BranchCommits[], tags: Tag[] }  => {
    const allCommits = new Map<string, Commit>();
    const branchCommits = giteaBranchCommitsList.map((giteaBranchCommits: GiteaBranchCommits) => {
        const commits = giteaBranchCommits.commits.map(c => transformGiteaCommitToCommit(c));
        const branchCommit = commits.find(c=> c.id === giteaBranchCommits.branch.commit.id);
        const branch: Branch = { ...transformGiteaBranchToBranchWithoutCommit(giteaBranchCommits.branch), commit: branchCommit };
        commits.forEach((commit: Commit) => {
            allCommits.set(commit.id, commit);
        })
        return { branch,commits }
    })
    const tags = giteaTags.map((giteaTag: GiteaTagResponse) => {
        const commit = allCommits.get(giteaTag.commit.sha)
        if (commit) {
            return null
        }
        return {
            name: giteaTag.name,
            commit: commit
        }
    })
    return {branchCommits, tags: tags.filter(tag => tag !== null)}
}

/**
 * 여러 파일의 변경 정보를 포함하는 git diff 텍스트를 파싱하여
 * GitDiff 객체의 배열로 변환하는 함수
 * @param diffText  https://docs.gitea.com/api/1.23/#tag/repository/operation/repoDownloadCommitDiffOrPatch
 * @returns GitDiff 객체의 배열
 */
export const transformGiteaV3PatchMultiFileDiff = (diffText: string): GitDiff[] => {
    // parse-diff 라이브러리를 사용하여 diff 텍스트 파싱
    const parsedFiles: parse.File[] = parse(diffText);
    const results: GitDiff[] = [];

    // 파싱된 각 파일 정보에 대해 반복
    for (const parsedFile of parsedFiles) {
        // GitDiff 객체 생성 및 속성 매핑
        const gitDiffObject: GitDiff = {
            // diff 내용 재구성 (hunk가 있을 경우)
            diff: reconstructDiffContent(parsedFile),

            // 파일 경로 매핑 (parse-diff는 'a/', 'b/' 접두사를 보통 제거해 줌)
            // '/dev/null'은 그대로 사용될 수 있음 (파일 생성/삭제 시)
            new_path: parsedFile.to || '',
            old_path: parsedFile.from || '',

            // 파일 모드 매핑 (parse-diff는 oldMode, newMode 속성을 제공할 수 있음)
            // 라이브러리 버전에 따라 속성 이름이 다를 수 있으니 확인 필요
            a_mode: parsedFile.oldMode || '', // 없으면 undefined
            b_mode: parsedFile.newMode || '', // 없으면 undefined

            // 파일 상태 플래그 매핑
            new_file: parsedFile.new ?? false,
            deleted_file: parsedFile.deleted ?? false,
            // 이름 변경 여부 판단: 경로가 다르고, 생성/삭제된 파일이 아니어야 함
            renamed_file:
                (parsedFile.from !== parsedFile.to) &&
                !(parsedFile.new ?? false) &&
                !(parsedFile.deleted ?? false),
        };

        // 결과 배열에 추가
        results.push(gitDiffObject);
    }

    return results;
}
