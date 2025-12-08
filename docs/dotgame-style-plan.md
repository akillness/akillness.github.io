# 도트게임 스타일 블로그 변환 계획서

## 1. 프로젝트 구조 분석

### 현재 상태
- **테마**: Jekyll Chirpy 테마 기반
- **스타일 시스템**: SCSS (Sass)
- **주요 디렉토리**:
  - `_sass/`: 스타일시트 파일들
    - `addon/`: 공통 스타일 및 변수
    - `colors/`: 라이트/다크 모드 색상 정의
    - `layout/`: 레이아웃별 스타일
  - `_includes/`: 재사용 가능한 HTML 컴포넌트
  - `_layouts/`: 페이지 레이아웃 템플릿
  - `assets/`: 정적 자원 (CSS, JS, 이미지)

### 현재 스타일 특징
- 모던하고 미니멀한 디자인
- 부드러운 그라데이션과 그림자 효과
- 반응형 디자인
- 라이트/다크 모드 지원

## 2. 도트게임 스타일의 특징

### 시각적 요소
1. **픽셀 아트 폰트**: 8-bit/16-bit 스타일의 도트 폰트
2. **레트로 색상 팔레트**: 제한된 색상 (보통 16색 이하)
3. **도트 패턴**: 격자 배경, 픽셀 테두리
4. **게임 UI 요소**: 버튼, 카드, 메뉴가 게임 인터페이스처럼 보임
5. **애니메이션**: 깜빡임, 픽셀 효과, 스프라이트 애니메이션

### 게임 스타일 UI 요소
- 픽셀 테두리 (pixelated borders)
- 도트 패턴 배경
- 게임 버튼 스타일
- 인벤토리/메뉴 느낌의 사이드바
- 게임 화면 같은 메인 콘텐츠 영역

## 3. 구현 계획

### Phase 1: 폰트 및 기본 스타일 설정

#### 1.1 픽셀 폰트 추가
- **목표**: 도트 스타일 폰트 적용
- **방법**:
  - Google Fonts 또는 로컬 폰트 사용
  - 추천 폰트:
    - `Press Start 2P` (Google Fonts)
    - `VT323` (Google Fonts)
    - `Pixelify Sans` (Google Fonts)
    - 또는 커스텀 픽셀 폰트 파일 추가
- **적용 위치**:
  - `_sass/addon/variables.scss`: 폰트 패밀리 변수 수정
  - `_includes/head.html`: 폰트 로드 추가

#### 1.2 기본 색상 팔레트 변경
- **목표**: 레트로 게임 색상으로 변경
- **방법**:
  - `_sass/colors/typography-light.scss`: 라이트 모드 색상
  - `_sass/colors/typography-dark.scss`: 다크 모드 색상
- **색상 팔레트 예시**:
  - 라이트 모드: 밝은 배경 (#F0F0F0), 어두운 텍스트 (#000000), 강조색 (#FF6B6B, #4ECDC4)
  - 다크 모드: 어두운 배경 (#1A1A2E), 밝은 텍스트 (#EEEEEE), 네온 색상 (#00D9FF, #FF00FF)

### Phase 2: UI 컴포넌트 스타일링

#### 2.1 사이드바 (Sidebar)
- **변경사항**:
  - 픽셀 테두리 추가
  - 게임 메뉴 느낌의 네비게이션
  - 아바타를 픽셀 아트 스타일로
- **파일**: `_sass/addon/commons.scss` (사이드바 섹션)

#### 2.2 카드/포스트 프리뷰
- **변경사항**:
  - 픽셀 테두리
  - 도트 패턴 배경 또는 그리드 배경
  - 호버 시 픽셀 효과
- **파일**: `_sass/addon/commons.scss`, `_sass/layout/home.scss`

#### 2.3 버튼
- **변경사항**:
  - 게임 버튼 스타일 (픽셀 테두리, 눌림 효과)
  - 깜빡이는 효과 (선택적)
- **파일**: `_sass/addon/commons.scss`

#### 2.4 탑바 (Topbar)
- **변경사항**:
  - 게임 HUD 느낌의 디자인
  - 픽셀 스타일 아이콘
- **파일**: `_sass/addon/commons.scss`

### Phase 3: 배경 및 패턴

#### 3.1 배경 패턴
- **방법**:
  - CSS로 도트 패턴 생성
  - 또는 이미지 배경 사용
- **적용**: `body` 요소에 배경 패턴 추가

#### 3.2 픽셀 테두리 유틸리티
- **방법**: SCSS 믹스인 생성
- **파일**: `_sass/addon/variables.scss` 또는 새 파일 생성

### Phase 4: 애니메이션 및 효과

#### 4.1 픽셀 애니메이션
- 깜빡이는 텍스트 효과
- 픽셀 스타일 트랜지션
- 호버 시 픽셀 효과

#### 4.2 게임 스타일 효과
- 버튼 클릭 효과
- 메뉴 선택 효과
- 로딩 애니메이션 (선택적)

### Phase 5: 반응형 및 접근성

#### 5.1 모바일 최적화
- 픽셀 스타일 유지하면서 반응형 디자인 보장
- 터치 친화적인 버튼 크기

#### 5.2 접근성
- 색상 대비 유지
- 키보드 네비게이션 지원

## 4. 기술적 구현 세부사항

### 4.1 픽셀 테두리 구현
```scss
// 픽셀 스타일 테두리 믹스인
@mixin pixel-border($color: #000, $width: 2px) {
  border: $width solid $color;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
```

### 4.2 도트 패턴 배경
```scss
// CSS로 도트 패턴 생성
background-image: 
  radial-gradient(circle, #000 1px, transparent 1px);
background-size: 20px 20px;
```

### 4.3 픽셀 폰트 적용
```scss
// variables.scss에서
$font-family-base: 'Press Start 2P', 'VT323', monospace;
$font-family-heading: 'Press Start 2P', monospace;
```

### 4.4 이미지 픽셀화
```scss
// 이미지를 픽셀 아트처럼 보이게
img {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
```

## 5. 파일 구조 변경 계획

### 새로 생성할 파일
1. `_sass/addon/pixel.scss`: 픽셀 스타일 유틸리티
2. `assets/css/dotgame-override.scss`: 커스텀 오버라이드 스타일 (선택적)

### 수정할 파일
1. `_sass/addon/variables.scss`: 폰트 및 기본 변수
2. `_sass/colors/typography-light.scss`: 라이트 모드 색상
3. `_sass/colors/typography-dark.scss`: 다크 모드 색상
4. `_sass/addon/commons.scss`: UI 컴포넌트 스타일
5. `_sass/layout/home.scss`: 홈페이지 스타일
6. `_includes/head.html`: 폰트 로드 추가
7. `assets/css/jekyll-theme-chirpy.scss`: 새 스타일 임포트 추가

## 6. 구현 우선순위

### 우선순위 1 (필수)
1. 픽셀 폰트 적용
2. 기본 색상 팔레트 변경
3. 픽셀 테두리 스타일 적용
4. 카드/버튼 기본 스타일 변경

### 우선순위 2 (중요)
1. 사이드바 스타일링
2. 배경 패턴 추가
3. 호버 효과 개선

### 우선순위 3 (선택)
1. 애니메이션 효과
2. 게임 스타일 아이콘
3. 커스텀 게임 요소 추가

## 7. 테스트 계획

### 브라우저 호환성
- Chrome/Edge (최신 버전)
- Firefox (최신 버전)
- Safari (최신 버전)
- 모바일 브라우저

### 반응형 테스트
- 데스크톱 (1920px+)
- 태블릿 (768px - 1199px)
- 모바일 (< 768px)

### 접근성 테스트
- 색상 대비 검사
- 키보드 네비게이션
- 스크린 리더 호환성

## 8. 예상 작업 시간

- Phase 1: 2-3시간
- Phase 2: 3-4시간
- Phase 3: 1-2시간
- Phase 4: 2-3시간
- Phase 5: 1-2시간

**총 예상 시간**: 9-14시간

## 9. 주의사항

1. **성능**: 픽셀 폰트는 파일 크기가 클 수 있으므로 웹폰트 최적화 필요
2. **가독성**: 픽셀 폰트는 작은 크기에서 읽기 어려울 수 있으므로 최소 폰트 크기 설정
3. **일관성**: 모든 요소에 일관된 픽셀 스타일 적용
4. **접근성**: 게임 스타일을 유지하면서도 접근성 표준 준수

## 10. 참고 자료

- [Google Fonts - Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P)
- [CSS Pixel Art Techniques](https://css-tricks.com/css-pixel-art/)
- [Retro Game Color Palettes](https://lospec.com/palette-list)

## 11. 다음 단계

1. 이 계획서 검토 및 승인
2. Phase 1부터 순차적으로 구현 시작
3. 각 Phase 완료 후 테스트 및 피드백
4. 최종 통합 테스트 및 배포

