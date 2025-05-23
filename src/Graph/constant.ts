import { MergeStyle, templateExtend, TemplateName } from '@gitgraph/react';

export const githubColors = [
  '#2188FF', // Blue
  '#34D058', // Green
  '#A371F7', // Purple
  '#F97583', // Pink
  '#FFAA2C', // Orange
  '#bec0c2',
  '#6f42c1', // Another Purple /*
  '#007904',
  '#0366d6', // Another Blue
  '#ffd33d', // Yellow
];

export const githubSubColors = [
  '#20c997', // Teal
  '#6f42c1', // Indigo (기존 보라색과 유사하나 다른 톤)
  '#fd7e14', // Bright Orange
  '#17a2b8', // Cyan / Info Blue
  '#6610f2', // Deeper Purple / Indigo
  '#dba0a6',
  '#28a745', // Success Green (기존 녹색과 다른 톤)
  '#ffc107', // Amber / Warning Yellow
  '#a67795',
  '#6c757d', // Mid Gray
];
export const gitTagColors =[
  // 기존 목록 중 가독성 좋은 색상 (8개)
  '#8D6E63', // 갈색 / 토프
  '#AFB42B', // 올리브 / 라임 그린
  '#546E7A', // 블루 그레이 / 슬레이트
  '#6A1B9A', // 짙은 보라 / 플럼
  '#AD1457', // 짙은 분홍 / 마젠타
  '#C62828', // 어두운 빨강 / 마룬
  '#00796B', // 어두운 청록
  '#303F9F', // 어두운 파랑 / 인디고

  // 추가 추천 색상 (가독성 좋은 어둡거나 채도 높은 색상 12개)
  '#4E342E', // 더 어두운 갈색
  '#827717', // 더 어두운 올리브/카키
  '#1A237E', // 매우 어두운 파랑/인디고
  '#D84315', // 짙은 주황
  '#4A148C', // 매우 어두운 보라
  '#004D40', // 매우 어두운 청록/녹색
  '#BF360C', // 짙은 주황/빨강
  '#263238', // 매우 어두운 블루 그레이/거의 검정
  '#B71C1C', // 또 다른 어두운 빨강
  '#01579B', // 짙은 하늘색 계열 파랑
  '#33691E', // 짙은 녹색
  '#E65100', // 짙은 호박색/주황
];

// 총 20개의 색상입니다.
export const tagLikeBranchStyle = {
  color: '#24292e',
  bgColor: '#f6f8fa',
  strokeColor: githubSubColors[0],
  font: 'normal 12px sans-serif',
  borderRadius: 0,
  pointerWidth: 0,
};

export const tagStyle = { // 태그 스타일 (GitHub와 유사하게)
  color: gitTagColors[0],
  bgColor: '#f6f8fa',
  font: 'normal 12px sans-serif',
  borderRadius: 4,
  pointerWidth: 6,
};

export const getGitTemplate: any = ({ colors = githubColors }:{colors?: string[]})=>{
  return templateExtend(TemplateName.Metro, {
    colors, // 정의한 색상 팔레트 적용
    branch: {
      lineWidth: 2, // 선 두께
      mergeStyle: MergeStyle.Bezier, // 부드러운 곡선 병합 스타일 ('straight' 대신)
      spacing: 30, // 브랜치 간 가로 간격 (조정 필요)
      label: {
        display: false, // 브랜치 라벨 표시
        bgColor: '#f6f8fa', // GitHub 라벨과 유사한 배경색
        color: '#24292e', // GitHub 라벨과 유사한 글자색
        borderRadius: 0, // 둥근 모서리
        font: 'normal 12px sans-serif', // 폰트 스타일
      },
    },
    commit: {
      spacing: 40, // 커밋 간 세로 간격 (조정 필요)
      hasTooltipInCompactMode: false,
      dot: {
        size: 8, // 커밋 점 크기
        strokeWidth: 12,
      },
      message: {
        display: true, // 커밋 메시지 표시
        displayAuthor: false, // 작성자 숨김 (GitHub 스타일)
        displayHash: true, // 해시 숨김 (GitHub 스타일)
        color: '#24292e', // 기본 글자 색상
        font: 'normal 14px sans-serif', // 폰트 스타일
      },
    },
  })
}