# Portfolio 2026 — 이현성

웹·Unity 개발자 **이현성**의 2026 포트폴리오 사이트입니다.  
블랙·화이트 모노톤을 기반으로, 전통적인 세로 스크롤 대신 **씬(Scene) 단위 전환**으로 콘텐츠를 탐색하는 단일 페이지 애플리케이션입니다.
[포트폴리오](https://czhskr.github.io/Portfolio/)

---

## 개요

이 프로젝트는 정적 HTML/CSS/JavaScript로 구성되어 있으며, 빌드 도구 없이 바로 배포할 수 있습니다.  
방문자는 휠·스와이프·키보드·상단 내비게이션으로 6개 장면을 오가며, GSAP 기반 **Iris(원형 리빌) 전환**과 섹션별 인터랙션을 경험합니다.

주요 특징은 다음과 같습니다.

- 뷰포트 고정형 씬 시스템 (전역 페이지 스크롤 없음)
- Works 3D 캐러셀, Skills 카드 스택, Hero 패럴랙스
- Works·Skills 섹션 배경 비디오
- Quick Contact 위젯, CMD 터미널 위젯, Back to Top 버튼

---

## 기술 스택

| 구분 | 내용 |
|------|------|
| 마크업 | HTML5, BEM 클래스 네이밍 |
| 스타일 | CSS Custom Properties — `style.css`, `scenes.css` |
| 스크립트 | Vanilla JavaScript (IIFE 모듈) |
| 애니메이션 | GSAP 3.13 (CDN) |
| 폰트 | Syne, IBM Plex Sans KR, Cormorant Garamond |
| 배포 | 정적 파일 (빌드 불필요) |

---

## 디렉터리 구조

```
Portfolio/
├── index.html
├── README.md
├── css/
│   ├── style.css           # 전역·컴포넌트·섹션 UI
│   └── scenes.css          # 씬 레이아웃·전환·백드롭
├── js/
│   ├── smooth-scroll.js    # 씬 내부 스크롤 보간
│   ├── hero-parallax.js    # Hero 패럴랙스
│   ├── scenes-gsap.js      # GSAP Iris 씬 전환
│   ├── scenes.js           # 씬 네비게이션 코어
│   ├── scene-bg.js         # Works/Skills 배경 비디오
│   ├── skills-cards.js     # Skills 카드 스택
│   ├── works-scene.js      # Works 3D 캐러셀
│   ├── works-challenges.js # Technical Challenges 패널
│   ├── works-preview.js    # Unity 카드 비디오 프리뷰
│   ├── widget.js           # Quick Contact·Back to Top
│   └── cmd-widget.js       # CMD 터미널 위젯
└── assets/
    ├── images/             # 로고, Hero, Works, Skills 아이콘
    └── videos/             # 섹션 배경·프로젝트 프리뷰 영상
```

---

## 씬 구성

| Index | ID | 라벨 | 설명 |
|-------|-----|------|------|
| 0 | `hero` | Home | 패럴랙스 백드롭과 소개 타이틀 |
| 1 | `about` | About | 자기소개 (내부 스크롤 지원) |
| 2 | `works` | Works | Web/Unity 프로젝트 캐러셀 |
| 3 | `skills` | Skills | 기술 스택 카드 스택 |
| 4 | `education` | Education | 학력 정보 |
| 5 | `contact` | Contact | 문의·SNS·푸터 |

### 탐색 방법

- **휠 / 상하 스와이프** — 이전·다음 씬 이동
- **키보드** — `↑` `↓`, `PageUp` `PageDown`
- **헤더 메뉴** — `data-scene-index` 기반 이동
- **Scene Rail** — 좌상단 로마 숫자 내비 (`scenes.js`가 동적 생성)
- **URL Hash** — `#hero`, `#works` 등과 동기화

씬 전환 시 좌측 내비 기준점에서 **물결(Iris) 펄스**가 확장되며, 다음 장면이 원형 클립으로 드러납니다.  
전환 완료·모듈 연동은 `scenes:change` 커스텀 이벤트로 처리됩니다.

---

## 섹션별 동작

### Hero

- 3레이어 이미지 백드롭 (배경 / 인물 / 모바일 단일 이미지)
- 데스크톱에서 마우스·터치 패럴랙스 (`hero-parallax.js`)
- `prefers-reduced-motion` 및 모바일에서는 정적 표시

### About

- `.scene-panel--scroll` 영역에서 `SmoothScroll`로 내용 스크롤

### Works

- **필터**: Web Games / Unity (기본 선택: Unity)
- **캐러셀**: 데스크톱 3D 실린더 / 모바일(≤768px) 좌우 슬라이드
- **조작**: 드래그·스와이프, 중앙 카드 위 휠, ← → 키, 하단 자동 루프 게이지
- **Technical Challenges**: 데스크톱 hover 시 포털 패널 (모바일 비표시)
- **Unity 프리뷰**: 카드 hover 시 썸네일 영상 재생
- **배경**: `assets/videos/works_bg.mp4`

전역 API `window.WorksScene` — `step`, `stepCard`, `consumeWheel`, `reset`

### Skills

- 북마크 탭으로 카테고리 전환
- `--offset` CSS 변수 기반 카드 스택 깊이 표현
- 탭·카드 클릭, 스와이프, ← → 키 지원
- **배경**: `assets/videos/skills_bg.mp4`

### Contact

- Job Offer, 이메일·GitHub·Instagram 링크
- 동일 씬 하단에 footer 포함

---

## 플로팅 UI

| 요소 | 위치 | 역할 |
|------|------|------|
| CMD 터미널 (`fab--cmd`) | 좌하단 | `help`, `goto`, `whoami`, `contact` 등 명령 |
| Back to Top (`fab--top`) | 우하단 (문의 버튼 왼쪽) | Hero 씬으로 이동 (Hero에서는 숨김) |
| Quick Contact (`fab--contact`) | 우하단 | 채널 링크·메일 전송 위젯 |

연락처 채널은 `js/widget.js` 상단 `CONTACT` 객체에서 설정합니다.  
값이 빈 문자열인 항목은 위젯에 노출되지 않습니다.

```javascript
const CONTACT = {
  email: "lhs0576@sillain.ac.kr",
  github: "https://github.com/czhskr",
  instagram: "la.bcrr",
};
```

---

## 스크립트 의존 관계

```
GSAP (CDN)
  ├── scenes-gsap.js  → window.ScenesAnimation
  └── works-scene.js  → window.WorksScene

smooth-scroll.js      → window.SmoothScroll
  └── scenes.js       → window.Scenes, scenes:change 발행

scenes.js 이후 로드:
  scene-bg.js, skills-cards.js, works-*.js, widget.js, cmd-widget.js
```

| 전역 API | 정의 위치 | 용도 |
|----------|-----------|------|
| `SmoothScroll` | smooth-scroll.js | 씬 내부 스크롤 |
| `ScenesAnimation` | scenes-gsap.js | GSAP 전환 |
| `Scenes` | scenes.js | `goTo`, `getIndex` |
| `WorksScene` | works-scene.js | Works 캐러셀·휠 처리 |
| `CmdWidget` | cmd-widget.js | CMD 패널·휠 소비 |

---

## 스타일 구조

**`style.css`** — 디자인 토큰(`:root`), Header, Hero, Works·Skills 카드, Contact, Widget, FAB, 반응형(`768px`, `900px`)

**`scenes.css`** — `.stage` / `.scene` 고정 레이아웃, 패널·백드롭 비디오, Scene Rail, Iris 전환 오버레이

### BEM 규칙

- 블록: `hero`, `works`, `skills-cards`
- 요소: `{block}__{element}`
- 수정자: `{block}__{element}--{modifier}`
- 상태: `is-active`, `is-center`, `is-open` 등 (JS 토글)
- `id`는 앵커·ARIA·JS 참조에만 사용

---

## 로컬 실행

```bash
npx serve .
```

또는 Live Server 등으로 `index.html`을 서빙합니다.  
`assets/` 경로의 이미지·비디오 로드를 위해 `file://` 직접 열기보다 로컬 서버 사용을 권장합니다.

---

## 접근성·동작 정책

- `prefers-reduced-motion: reduce` — 패럴랙스, 자동 루프, 배경 비디오 비활성
- 모바일 Works — 3D 실린더 대신 플랫 슬라이드, Technical Challenges 미표시
- Works 씬 이탈 시 — `WorksScene.reset()`, 챌린지 패널·Unity 비디오 정리

---

## 저작권

© 2026 Lee HyunSung. All rights reserved.
