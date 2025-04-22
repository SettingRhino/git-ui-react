import type { Commit } from '../common/type.ts';
import type { CommitViewData } from './type.ts';

export const convertCommitView = (commit: Commit, handleParentClick?: (id: string) => void): CommitViewData => {
  // Author === committers
  // Only Author
  const timeConvert = (inputDateString: string) => {
    try {
      const date = new Date(inputDateString);

      // 원하는 형식에 맞게 각 부분을 추출하고 포맷합니다.
      // getMonth()는 0부터 시작하므로 +1 해줍니다.
      // 각 부분이 두 자리가 되도록 padStart()로 0을 채웁니다.
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // 월 (01-12)
      const day = String(date.getDate()).padStart(2, '0'); // 일 (01-31)
      const hours = String(date.getHours()).padStart(2, '0'); // 시 (00-23)
      const minutes = String(date.getMinutes()).padStart(2, '0'); // 분 (00-59)
      const seconds = String(date.getSeconds()).padStart(2, '0'); // 초 (00-59)

      // 포맷에 맞게 문자열을 조합합니다.
      return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    } catch {
      return '';
    }
  };

  let committers = [
    {
      title: 'Author',
      date: timeConvert(commit.authored_date || ''),
      items: [{ title: 'Name:', value: commit.author_name || '' }, { title: 'Email:', value: commit.author_email || '' }],
      id: `${commit.id}_author`,
    },
  ];
  if (!(commit.author_name === commit.committer_name && commit.author_email === commit.committer_email && commit.authored_date === commit.committed_date)) {
    committers = [
      ...committers, {
        title: 'Committers',
        date: timeConvert(commit.committed_date || ''),
        items: [{ title: 'Name:', value: commit.committer_name || '' }, { title: 'Email:', value: commit.committer_email || '' }],
        id: `${commit.id}_committers`,
      },
    ];
  }
  return {
    title: {
      title: 'Commit:',
      value: commit.id || '',
    },
    message: {
      message: commit.message || '',
    },
    committers: {
      committers: committers,
    },
    parents: {
      title: 'Parent',
      parents: commit?.parent_ids || [],
      handleParentClick,
    },
  };
};

// navigator는 https에서만 작동하기에 https가 아닌 환경에서 대체 함수
const fallbackCopyTextToClipboard = (copyString: string) => {
  const textArea = document.createElement('textarea');
  textArea.value = copyString;
  textArea.style.position = 'fixed';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  let successful = false;
  try {
    successful = document.execCommand('copy');
  } catch (err) {
    console.error('failed Copy', err);
    throw new Error('Could not copy to clipboard');
  } finally {
    document.body.removeChild(textArea);
  }
  if (!successful) {
    throw new Error('Could not copy to clipboard');
  }
};

export const clipboardCopy = async (copyString: string): Promise<void> => {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(copyString);
    return;
  }
  await navigator.clipboard.writeText(copyString);
  return;
};

export const truncateString = (str: string) => {
  // null/undefined인 경우 처리
  if (!str) {
    return ''; // 혹은 다른 기본값 반환
  }
  if (str.length > 8) {
    return str.slice(0, 8); // 0번째 인덱스부터 8번째 인덱스 전까지 잘라냅니다.
  } else {
    return str; // 8글자 이하이면 원본 문자열을 그대로 반환합니다.
  }
};
