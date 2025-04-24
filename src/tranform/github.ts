import parse from 'parse-diff';
import { parseISO } from 'date-fns';
import { format, toZonedTime } from 'date-fns-tz';
import { Branch, Commit, GitDiff, Tag} from "../common/type.ts";
import { BranchCommits } from "../Graph";

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


export type GitHubCommitResponse = {
    sha: string;
    commit: {
        author: {
            name?: string | null;
            email?: string | null;
            date?: string | null;
        };
        committer: {
            name?: string | null;
            email?: string | null;
            date?: string | null;
        };
        message: string;
        // tree, url, comment_count, verification 등은 Commit 타입에 직접 매핑되지 않음
    };
    html_url?: string | null;
    parents: {
        sha: string;
        // url, html_url 등
    }[];
    // author(user), committer(user) 등은 Commit 타입에 직접 매핑되지 않음
    // node_id, url, comments_url 등
};
export type GitHubBranchResponse  = {
    name: string;
    commit: GitHubCommitResponse;
    protected: boolean;
    protection: {
        enabled: boolean;
        required_status_checks: {
            enforcement_level: string;
            contexts: string[];
            checks: any[]; // 실제 타입은 더 복잡할 수 있음
        };
    };
    protection_url: string;
    // 참고: 실제 GitHub API 응답에는 더 많은 필드가 있을 수 있습니다.
    // 예를 들어 html_url 등이 web_url에 해당될 수 있습니다.
}

export type GitHubTagResponse = {
    name: string;
    commit: {
        sha: string;
    }
}

export type GitHubBranchCommits = {
    branch: GitHubBranchResponse,
    commits: GitHubCommitResponse[],
}

/**
 * UTC ISO 문자열을 한국 시간(KST) 형식의 문자열로 변환합니다.
 * 예: "2025-04-23T05:47:57Z" -> "2025-04-23T14:47:57.000+09:00"
 * @param dateString UTC ISO 8601 형식의 날짜 문자열
 * @returns "YYYY-MM-DDTHH:mm:ss.SSS+HH:mm" 형식의 KST 문자열, 실패 시 에러 발생
 */
const formatUtcToKstStringWithOffset = (dateString: string): string => {
    try {
        // 1. ISO 문자열 파싱 (UTC Date 객체 생성)
        const utcDate = parseISO(dateString);

        // 2. 한국 시간대 지정 (IANA 이름 사용)
        const timeZone = 'Asia/Seoul';

        // 3. UTC Date 객체를 한국 시간대(KST)로 변환 (함수 이름 수정)
        // const zonedDate = utcToZonedTime(utcDate, timeZone); // 이전 코드 (오류 발생)
        const zonedDate = toZonedTime(utcDate, timeZone); // 수정된 함수 호출

        // 4. 원하는 형식으로 포맷팅 (이전과 동일)
        const formatString = "yyyy-MM-dd'T'HH:mm:ss.SSSxxx";
        return format(zonedDate, formatString, { timeZone: timeZone });

    } catch (error) {
        console.error("Error formatting date:", error);
        return ''
    }
}

/**
 * GitHub API 커밋 객체를 사용자 정의 Commit 타입 객체로 변환합니다.
 * @param githubCommit GitHub API로부터 받은 커밋 객체
 * @returns 변환된 Commit 객체
 */
export const transformGithubCommitToCommit = (githubCommit: GitHubCommitResponse): Commit => {
    // 커밋 메시지에서 제목(title)과 본문(message) 분리
    const messageLines = githubCommit.commit.message.split('\n');
    const title = messageLines[0] || ''; // 첫 줄을 제목으로 사용
    // 제목 다음 줄부터 본문으로 사용 (보통 제목과 본문 사이에 빈 줄이 있음)
    let messageBody = '';
    if (messageLines.length > 1) {
        // 첫 빈 줄 찾기 (제목 바로 다음 줄이거나 그 이후)
        let bodyStartIndex = 1;
        if (messageLines[1]?.trim() === '') {
            bodyStartIndex = 2; // 빈 줄 다음부터 본문 시작
        }
        messageBody = messageLines.slice(bodyStartIndex).join('\n').trim();
    }

    // Commit 객체 생성 및 반환
    return {
        id: githubCommit.sha,
        created_at: formatUtcToKstStringWithOffset(githubCommit.commit.committer?.date) || '', // committer date 사용
        parent_ids: githubCommit.parents.map(parent => parent.sha),
        title: title.trim(),
        message: messageBody, // 추출된 본문
        author_name: githubCommit.commit.author?.name ?? undefined,
        author_email: githubCommit.commit.author?.email ?? undefined,
        authored_date: formatUtcToKstStringWithOffset(githubCommit.commit.author?.date) ?? undefined,
        committer_name: githubCommit.commit.committer?.name ?? undefined,
        committer_email: githubCommit.commit.committer?.email ?? undefined,
        committed_date: formatUtcToKstStringWithOffset(githubCommit.commit.committer?.date) || '',
    };
}

export const transformGithubBranchToBranch = (githubBranch: GitHubBranchResponse): Branch => {
    const commit = transformGithubCommitToCommit(githubBranch.commit)
    return {
        name: githubBranch.name,
        protected: githubBranch.protected,
        commit,
        // --- 아래 필드들은 Github API 기본 브랜치 응답에 직접 존재하지 않음 ---
        // default: 레포지토리 정보 API를 통해 해당 브랜치가 default인지 확인해야 함
        default: undefined,
    };
}

export const transformGitHubTagToCommit = (gitHubTag: GitHubTagResponse, gitHubCommit: GitHubCommitResponse) :Tag => {
    const commit =transformGithubCommitToCommit(gitHubCommit)
    return {
        name: gitHubTag.name,
        commit: commit
    }
}

export const transformGitHubBranchCommits = (gitHubBranchCommitsList :GitHubBranchCommits[], githubTags: GitHubTagResponse[] ): { branchCommits: BranchCommits[], tags: Tag[] }  => {
    const allCommits = new Map<string, Commit>();
    const branchCommits = gitHubBranchCommitsList.map((gitHubBranchCommits: GitHubBranchCommits) => {
        const commits = gitHubBranchCommits.commits.map(c => transformGithubCommitToCommit(c));
        const branch: Branch = transformGithubBranchToBranch(gitHubBranchCommits.branch);
        commits.forEach((commit: Commit) => {
            allCommits.set(commit.id, commit);
        })
        return { branch,commits }
    })
    const tags = githubTags.map((githubTag: GitHubTagResponse) => {
        const commit = allCommits.get(githubTag.commit.sha)
        if (commit) {
            return null
        }
        return {
            name: githubTag.name,
            commit: commit
        }
    })
    return {branchCommits, tags: tags.filter(tag => tag !== null)}
}


/**
 * 여러 파일의 변경 정보를 포함하는 git diff 텍스트를 파싱하여
 * GitDiff 객체의 배열로 변환하는 함수
 * @param diffText Accept: application/vnd.github.v3.patch returnValue
 * @returns GitDiff 객체의 배열
 */
export const transformGitHubV3PatchMultiFileDiff = (diffText: string): GitDiff[] => {
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

export const gitContentBase64Decode = (content: string): string | null => {
    if (typeof content === 'string') {
        try {
            // 1. atob()로 Base64 디코딩 (결과는 binary string)
            const binaryString = atob(content);

            // 2. Binary string을 바이트 배열(Uint8Array)로 변환
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // 3. TextDecoder를 사용하여 바이트 배열을 UTF-8 문자열로 해석
            const decoder = new TextDecoder('utf-8'); // 또는 'euc-kr' 등 원본 인코딩 지정
            const decodedString = decoder.decode(bytes);

            return decodedString;
            // 예상 출력: Git 형상 테스트 레포지토리 Graph 형상을 API로 얻기 위한 테스트 레포

        } catch (e) {
            return null
        }
    }else{
        return null
    }
}