# 미니 스프레드시트 앱 (Mini Spreadsheet)

Vanilla JS로 구현된 5×5 브라우저 스프레드시트입니다.  
SDD(Spec-Driven Development) 방법론으로 설계되었으며, 데이터 입력부터 Excel/CSV Export까지 지원합니다.

file:///Users/guhakim/spreadsheet-app/index.html
---

## SDD (Spec-Driven Development)

### PRD — 제품 요구사항 (사용자 관점)

| 항목 | 내용 |
|------|------|
| **목적** | 브라우저에서 즉시 작동하는 가벼운 바둑판형 데이터 입력 도구 |
| **대상 사용자** | 빠른 데이터 입력이 필요한 오피스 사용자 |
| **핵심 가치** | 설치 불필요, 직관적 조작, Google Sheets 호환 Export |

#### User Stories
1. 셀을 클릭하면 좌표(`C3`)를 상단에 표시하고 해당 행/열 헤더를 하이라이트한다
2. 셀을 더블클릭하여 데이터를 입력/수정한다
3. `Enter` / 방향키(`↑↓←→`)로 연속 입력한다
4. Export 버튼 하나로 `.xlsx` 또는 `.csv` 파일을 다운로드한다
5. Google Sheets에 가져올 때 한글 깨짐·칸 밀림 없이 복원된다

---

### SRS — 소프트웨어 요구사항 (기능 조건)

#### UI 구성
```
┌────────────────────────────────────────────┐
│  [Cell: A1]              [Excel Export]    │  ← 상단 툴바
├────┬────┬────┬────┬────┬────┤
│    │ A  │ B  │ C  │ D  │ E  │              │  ← 열 헤더
├────┼────┼────┼────┼────┼────┤
│ 1  │    │    │    │    │    │              │
├────┼────┼────┼────┼────┼────┤
│ 2  │    │    │    │    │    │              │  ← 데이터 셀
├────┼────┼────┼────┼────┼────┤
│ 3  │    │    │    │    │    │
└────┴────┴────┴────┴────┴────┘
  ↑ 행 헤더
```

#### 인터랙션 조건
1. **셀 클릭** → `.active` 클래스(파란 테두리) 부여, 기존 활성화 제거
2. **좌표 연동** → 상단 표시창을 `C3` 형식으로 갱신, 매칭되는 행/열 헤더에 `.highlight` 부여
3. **값 입력** → 더블클릭 시 편집 모드 진입, `blur` 또는 `Enter` 시 저장
4. **Export** → `spreadsheet.xlsx` (`xlsx`) 또는 BOM 포함 `.csv` (`csv` 브랜치) 다운로드

---

### TRD — 기술 요구사항 (구현 구조)

#### 상태(State) 설계 — Single Source of Truth

```javascript
// 1. 그리드 규격
const CONFIG = { ROWS: 5, COLS: 5 }; // A~E, 1~5

// 2. 활성화 상태
let activeCell = { row: null, col: null };

// 3. 데이터 저장소 (2차원 배열)
let spreadsheetData = Array.from({ length: CONFIG.ROWS }, () =>
  Array(CONFIG.COLS).fill("")
);
```

#### 아키텍처 결정 사항

| 결정 | 적용 | 근거 |
|------|------|------|
| **렌더링 방식** | JS 동적 생성 (`createElement`) | HTML 하드코딩 배제, 유지보수성 |
| **이벤트 처리** | 개별 리스너 (본 프로젝트) | 직관적 학습, 작은 그리드에 적합 |
| **Export 포맷** | SheetJS (`xlsx`) | Google Sheets 호환성, 한글 보존 |

#### 함수 모듈화 (1함수 1역할)

| 함수 | 역할 | 트리거 |
|------|------|--------|
| `createGrid()` | 5×5 그리드 동적 생성 | `DOMContentLoaded` |
| `updateFocusedCell()` | 상단 좌표 표시 갱신 | 셀 `focus` |
| `highlightHeaders()` | 행/열 헤더 하이라이트 | 셀 `focus` |
| `collectGridData()` | 2차원 배열 데이터 수집 | Export 호출 |
| `exportSpreadsheet()` | Excel 파일 생성 + 다운로드 | 버튼 `click` |

#### 셀 이동 바인딩

| 키 | 이동 | 경계 처리 |
|-----|------|-----------|
| `↓` / `Enter` | 다음 행 (같은 열) | 마지막 → 첫 행 wrap |
| `↑` | 이전 행 (같은 열) | 첫 → 마지막 행 wrap |
| `→` | 다음 열 (같은 행) | 마지막 → 첫 열 wrap |
| `←` | 이전 열 (같은 행) | 첫 → 마지막 열 wrap |

---

## QA 체크리스트

- [ ] **좌표 정확도**: 1행 2열(`col=2, row=1`) 클릭 시 상단에 `C1` 표시
- [ ] **하이라이트 잔상 제거**: `A1` → `D5` 순차 클릭 시 A행·1열 하이라이트 완전 제거
- [ ] **데이터 지속성**: 셀에 값 입력 → 다른 셀 이동 → 복귀 시 값 보존
- [ ] **Export 동작**: 버튼 클릭 시 `spreadsheet.xlsx` 파일 다운로드

---

## 파일 구조

```
spreadsheet-app/
├── index.html    # HTML 구조 (툴바 + 그리드 영역)
├── style.css     # 1280×720 최적화 레이아웃
├── app.js        # 비즈니스 로직 (5개 함수 모듈화)
└── README.md     # SDD 명세 + 사용 가이드
```

## 사용 방법

```bash
open index.html
```

1. 셀을 클릭하여 좌표와 헤더 하이라이트 확인
2. 데이터 입력 후 `Enter` / `↑↓←→` 로 셀 이동
3. **Excel Export** 버튼 → `spreadsheet.xlsx` 다운로드

## Tech Stack

- **Vanilla HTML / CSS / JS** — 순수 웹 기술
- **SheetJS (xlsx)** — Excel 파일 생성

## License

MIT
