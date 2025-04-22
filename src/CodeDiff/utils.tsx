import type { ConvertDiffSettingType, GetOriginFile,
  GetTwoWayOriginFile } from './type.ts';
import parseDiff from 'parse-diff';
import { CodeViewMode,
  GitChangeStatusIcon } from './constant.ts';
import { CodeDiffBasicLabelTitle } from './LabelView.tsx';

/**
 * Git diff hunk 헤더 문자열에서 변경 전후 시작 라인 번호 중 더 작은 값을 반환합니다.
 *
 * @param hunkHeader - "@@ -7,6 +7,11 @@"와 같은 형식의 hunk 헤더 문자열.
 * @returns 두 시작 라인 번호 중 더 작은 숫자. 형식이 잘못되었거나 숫자를 파싱할 수 없으면 null을 반환합니다.
 */
const getEarliestStartLine = (hunkHeader: string): number | null => {
  // 정규 표현식: @@ -(\d+),\d+ \+(\d+),\d+ @@ 형식 매칭
  // 그룹 1: 변경 전 시작 라인 번호 (\d+)
  // 그룹 2: 변경 후 시작 라인 번호 (\d+)
  const pattern = /@@\s*-(\d+),\d+\s*\+(\d+),\d+\s*@@/;

  // 문자열에서 정규식과 매칭되는 부분 검색
  const match = pattern.exec(hunkHeader);

  // 매칭 결과가 있고, 필요한 캡처 그룹(1, 2)이 존재하는지 확인
  if (match && match[1] && match[2]) {
    try {
      // 캡처된 문자열(그룹 1, 2)을 10진수 정수로 변환
      const oldStartLine = parseInt(match[1], 10);
      const newStartLine = parseInt(match[2], 10);

      // parseInt 결과가 유효한 숫자인지 확인 (NaN 체크)
      if (isNaN(oldStartLine) || isNaN(newStartLine)) {
        return null;
      }

      // 두 시작 라인 번호 중 더 작은 값을 반환
      return Math.min(oldStartLine, newStartLine);
    } catch {
      // parseInt 등에서 예외 발생 시 (일반적이지 않음)
      return null;
    }
  } else {
    // 정규식 패턴과 매칭되지 않으면 null 반환
    return null;
  }
};

export const parseGitDiff = (diff: string): { origin: string; change: string; lineOffset: number } | null => {
  try {
    const files = parseDiff(diff);
    let offset = -1;
    if (files && files.length > 0) {
      const file = files[0];

      const originalLines: string[] = [];
      const modifiedLines: string[] = [];
      file.chunks.forEach((hunk: any) => {
        const lineNumber = getEarliestStartLine(hunk?.content || '');
        if (lineNumber) {
          if (offset < 0) {
            offset = lineNumber;
          } else if (lineNumber < offset) {
            offset = lineNumber;
          }
        }
        hunk.changes.forEach((change: any) => {
          // 개행 예외
          if (change.content === '\\ No newline at end of file') {
            return;
          }

          // change.content 는 줄 내용 앞에 +, -, ' ' 가 붙어있음
          const lineContent = change.content.substring(1); // 앞의 기호 제거

          if (change.type === 'del' || change.type === 'normal') {
            // 삭제된 줄(-) 또는 변경 없는 줄( ) -> 원본에 포함
            originalLines.push(lineContent);
          }
          if (change.type === 'add' || change.type === 'normal') {
            // 추가된 줄(+) 또는 변경 없는 줄( ) -> 수정본에 포함
            modifiedLines.push(lineContent);
          }
        });
      });
      const originalText = originalLines.join('\n');
      const modifiedText = modifiedLines.join('\n');
      return {
        origin: originalText,
        change: modifiedText,
        lineOffset: (offset - 1 < 0) ? 0 : offset - 1,
      };
    }
    return null;
  } catch {
    return null;
  }
};

export const convertDiffSetting: ConvertDiffSettingType = (commit, diff, handleClose, getOriginFile) => {
  try {
    if (!diff) {
      return undefined;
    }
    if (diff.new_file) {
      const [originalCommitID] = commit?.parent_ids || [];
      let func: GetOriginFile | undefined;
      if (originalCommitID && commit?.id && !!getOriginFile) {
        func = () => {
          return getOriginFile(commit?.id, diff.new_path);
        };
      }
      return {
        mode: CodeViewMode.Added,
        diff: diff.diff || '',
        getOriginFile: func,
        title: diff.new_path,
        handleClose,
      };
    }
    if (diff.deleted_file) {
      return {
        mode: CodeViewMode.Changed,
        diff: diff.diff || '',
        handleClose,
      };
    }
    if (diff.renamed_file) {
      // Renamed
      return {
        mode: CodeViewMode.Label,
        title: <CodeDiffBasicLabelTitle iconStatus={GitChangeStatusIcon.Renamed} str={`Rename ${diff.old_path} => ${diff.new_path}`} />,
        content: `Rename ${diff.old_path} => ${diff.new_path}`,
        handleClose,
      };
    }
    if (diff.diff) {
      const [originalCommitID] = commit?.parent_ids || [];
      let func: (GetTwoWayOriginFile) | undefined;
      if (originalCommitID && commit?.id && !!getOriginFile) {
        func = async () => {
          const [commitRawFile, oldCommitRawFile] = await Promise.all([getOriginFile(commit?.id, diff.new_path), getOriginFile(originalCommitID, diff.new_path)]);
          // const commitRawFile = await getOriginFile(commit?.id, diff.new_path);
          // const oldCommitRawFile = await getOriginFile(originalCommitID, diff.new_path);
          if (!!commitRawFile && !!oldCommitRawFile) {
            return {
              oldValue: oldCommitRawFile,
              newValue: commitRawFile,
            };
          }
          return null;
        };
      }
      return {
        mode: CodeViewMode.Changed,
        getOriginFile: func,
        diff: diff.diff || '',
        handleClose,
      };
    } else if (diff.a_mode !== diff.a_mode) {
      return {
        mode: CodeViewMode.Label,
        title: <CodeDiffBasicLabelTitle iconStatus={GitChangeStatusIcon.ModeChanged} str={`mode Change ${diff.a_mode} => ${diff.b_mode}`} />,
        content: `mode Change ${diff.a_mode} => ${diff.b_mode}`,
        handleClose,
      };
    }
    return {
      mode: CodeViewMode.Label,
      title: <CodeDiffBasicLabelTitle iconStatus={GitChangeStatusIcon.Unknown} str="Unknown Status" />,
      content: 'Unknown Status',
      handleClose,
    };
  } catch {
    return {
      mode: CodeViewMode.Label,
      title: <CodeDiffBasicLabelTitle iconStatus={GitChangeStatusIcon.Unknown} str="Unknown Status" />,
      content: 'Unknown Status',
      handleClose,
    };
  }
};
