# 미니 스프레드시트 앱 (Mini Spreadsheet)

5×5 그리드 기반의 브라우저 스프레드시트 앱입니다.  
셀 클릭 → 헤더 하이라이트 → 데이터 입력 → Excel Export까지 지원합니다.

---

## 제작 과정 (Development Log)

### 1단계: 프로젝트 설계 및 요구사항 정의

**목표:** 1280×720 해상도에 최적화된 미니 스프레드시트 제작

| 항목 | 내용 |
|------|------|
| **그리드 크기** | 5행 × 5열 (A~E, 1~5) |
| **핵심 기능** | 셀 선택/입력, 헤더 하이라이트, Excel Export |
| **해상도 타겟** | 1280×720 |
| **라이브러리** | SheetJS (xlsx) — Excel Export 전용 |

**데이터 구조 설계:**
```
data-coordinate 속성을 좌표 식별자로 사용
예: A1, B3, E5 등
열(COLUMNS) = ['A','B','C','D','E']
행(ROW_COUNT) = 5
```

---

### 2단계: HTML 구조 작성 (`index.html`)

- `<head>`에서 CDN으로 SheetJS 로드
- 상단 헤더 영역: 현재 셀 좌표 표시(`#current-cell-id`) + Excel Export 버튼
- 메인 영역: `#grid` 컨테이너 (JS로 동적 생성)
- `<body>` 최하단에 `app.js` 로드 (DOM 파싱 완료 보장)

---

### 3단계: CSS 레이아웃 (`style.css`)

**1280×720 방어선:**
```css
.app-container {
    width: 1280px;
    height: 720px;
}
```

**그리드 구조 (6열):**
```
grid-template-columns: 60px repeat(5, minmax(150px, 1fr))
→ 행번호(60px) + 데이터 5열(각 150px~가변)
```

**핵심 스타일:**
- `.cell-input:focus` — 파란색 inset box-shadow로 포커스 강조
- `.active-header` — 선택된 행/열 헤더를 진한 파란색(`#1e3a8a`)으로 하이라이트

---

### 4단계: JavaScript 비즈니스 로직 (`app.js`)

**원칙: 1함수 1역할 (각 함수는 하나의 책임만 수행)**

| 함수 | 역할 |
|------|------|
| `createGrid()` | 5×5 그리드 UI 동적 생성 |
| `updateFocusedCell()` | 선택된 셀 좌표를 상단 UI에 표시 |
| `highlightHeaders()` | 선택된 셀에 해당하는 행/열 헤더 강조 |
| `collectGridData()` | 2차원 배열로 데이터 수집 |
| `exportSpreadsheet()` | SheetJS로 Excel 파일 생성 및 다운로드 |

**셀 이동 기능 (v1.1 추가):**

| 키 | 동작 | 경계 처리 |
|-----|------|-----------|
| `↓` / `Enter` | 다음 행 (같은 열) | 마지막 행 → 첫 행 순환 |
| `↑` | 이전 행 (같은 열) | 첫 행 → 마지막 행 순환 |
| `→` | 다음 열 (같은 행) | 마지막 열 → 첫 열 순환 |
| `←` | 이전 열 (같은 행) | 첫 열 → 마지막 열 순환 |

**데이터 흐름:**
```
사용자 입력 → input.value 저장
                    ↓
버튼 클릭 → collectGridData() → 2차원 배열
                    ↓
          SheetJS (aoa_to_sheet → writeFile)
                    ↓
          spreadsheet.xlsx 다운로드
```

---

### 5단계: 검증 및 테스트

- ✅ JavaScript 문법 검사 (`node --check`) 통과
- ✅ DOM 로드 순서 (script 하단 배치) 정상
- ✅ XLSX CDN 로드 후 Export 실행 구조
- ✅ `focus` 이벤트 기반 헤더 하이라이트 정상 동작
- ✅ 방향키 셀 이동 및 경계 순환 정상

---

## 파일 구조

```
spreadsheet-app/
├── index.html      # HTML 구조 (헤더 + 그리드 영역)
├── style.css       # 1280×720 최적화 레이아웃
├── app.js          # 비즈니스 로직 (1함수 1역할)
└── README.md       # 제작 과정 기록
```

## 사용 방법

```bash
# 브라우저로 열기
open index.html
# 또는
open -a "Google Chrome" index.html
```

1. 셀을 클릭하면 상단에 좌표가 표시되고 해당 행/열 헤더가 하이라이트됩니다
2. 텍스트를 입력하고 `Enter` / 방향키로 셀을 이동합니다
3. **Excel Export** 버튼을 누르면 `spreadsheet.xlsx` 파일이 다운로드됩니다

## Tech Stack

- **Vanilla HTML/CSS/JS** — 순수 웹 기술만 사용
- **SheetJS (xlsx)** — Excel 파일 생성 및 다운로드

## License

MIT
