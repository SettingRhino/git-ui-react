import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import dts from 'vite-plugin-dts' // 타입 정의(.d.ts) 파일 생성 플러그인
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr(),
    dts({ // 타입 정의 파일 생성 설정
      insertTypesEntry: true, // 타입 정의 파일에 대한 진입점(entry) 생성
      // outDir: 'dist/types', // 타입 정의 파일 출력 디렉토리 (선택 사항)
    }),
  ],
  build: {
    // 라이브러리 모드 설정
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'), // 라이브러리 진입점 파일
      name: 'GitUIReact', // UMD 빌드 시 사용할 전역 변수 이름 (CamelCase 권장)
      formats: ['es', 'umd'], // 빌드할 포맷 (ES Module, UMD)
      fileName: (format) => `git-ui-react.${format}.js`, // 출력 파일 이름 형식
    },
    // 라이브러리 사용자가 직접 설치해야 하는 의존성 명시
    rollupOptions: {
      // 라이브러리에 번들링하지 않을 외부(external) 모듈 설정
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        // UMD 빌드 시 외부 모듈을 전역 변수로 매핑
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'ReactJsxRuntime', // 최신 JSX 변환 지원
        },
      },
    },
    outDir: 'lib',
    sourcemap: true, // 소스맵 생성 (디버깅에 유용)
    emptyOutDir: true, // 빌드 시 dist 디렉토리 비우기
    // CSS를 별도 파일로 추출 (선택 사항, 권장)
    // cssCodeSplit: true, // 기본적으로 true
  },
})