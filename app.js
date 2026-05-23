// ==========================================
// 전역 설정 및 상수 정의
// ==========================================
const COLUMNS = ['A', 'B', 'C', 'D', 'E']; // 열 헤더 리스트 (5열)
const ROW_COUNT = 5;                       // 행 개수 (5행)

// DOM 요소 캐싱
const gridElement = document.getElementById('grid');
const currentCellIdElement = document.getElementById('current-cell-id');
const exportBtn = document.getElementById('export-btn');

// ==========================================
// 1함수 1역할: 핵심 기능 분할 구현
// ==========================================

/**
 * 역할 1: 5x5 크기의 스프레드시트 그리드 UI를 화면에 동적으로 생성합니다.
 */
function createGrid() {
    // [단계 1] 맨 왼쪽 상단 빈 모서리 셀 생성
    const cornerHeader = document.createElement('div');
    cornerHeader.className = 'cell header-cell';
    gridElement.appendChild(cornerHeader);

    // [단계 2] 상단 열 헤더 (A ~ E) 생성 및 배치
    COLUMNS.forEach(col => {
        const header = document.createElement('div');
        header.className = 'cell header-cell col-header';
        header.setAttribute('data-col', col);
        header.textContent = col;
        gridElement.appendChild(header);
    });

    // [단계 3] 가로 행 단위로 행 헤더와 입력용 데이터 셀들 생성
    for (let r = 1; r <= ROW_COUNT; r++) {
        // 행 번호 헤더 생성 (1 ~ 5)
        const rowHeader = document.createElement('div');
        rowHeader.className = 'cell header-cell row-header';
        rowHeader.setAttribute('data-row', r);
        rowHeader.textContent = r;
        gridElement.appendChild(rowHeader);

        // 해당 행에 포함되는 데이터 입력 칸(A~E)들 순차 생성
        COLUMNS.forEach(col => {
            const cellContainer = document.createElement('div');
            cellContainer.className = 'cell';

            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'cell-input';
            // 데이터 추적 및 좌표 결합을 위해 커스텀 데이터 속성 부여 (예: data-coordinate="C1")
            input.setAttribute('data-coordinate', `${col}${r}`);
            input.setAttribute('data-col', col);
            input.setAttribute('data-row', r);

            // 이벤트 바인딩: 사용자가 입력칸을 클릭(포커스)했을 때의 동작 연결
            input.addEventListener('focus', () => {
                updateFocusedCell(input);
                highlightHeaders(r, col);
            });

            // 방향키 및 Enter 로 셀 이동
            input.addEventListener('keydown', (e) => {
                const colIndex = COLUMNS.indexOf(col);
                let targetCol = col;
                let targetRow = r;

                switch (e.key) {
                    case 'Enter':
                    case 'ArrowDown':
                        e.preventDefault();
                        targetRow = r < ROW_COUNT ? r + 1 : 1;
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        targetRow = r > 1 ? r - 1 : ROW_COUNT;
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        targetCol = COLUMNS[(colIndex + 1) % COLUMNS.length];
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        targetCol = COLUMNS[(colIndex - 1 + COLUMNS.length) % COLUMNS.length];
                        break;
                }

                if (targetCol !== col || targetRow !== r) {
                    const targetInput = document.querySelector(`.cell-input[data-coordinate="${targetCol}${targetRow}"]`);
                    if (targetInput) targetInput.focus();
                }
            });

            cellContainer.appendChild(input);
            gridElement.appendChild(cellContainer);
        });
    }
}

/**
 * 역할 2: 현재 사용자가 선택(포커스)한 셀의 문자 좌표를 읽어와 상단 UI에 업데이트합니다.
 * @param {HTMLInputElement} cell - 현재 포커스된 input 요소
 */
function updateFocusedCell(cell) {
    const coordinate = cell.getAttribute('data-coordinate');
    currentCellIdElement.textContent = `Cell: ${coordinate}`;
}

/**
 * 역할 3: 선택된 셀에 매칭되는 행 헤더와 열 헤더를 찾아 강조(하이라이트) 처리를 수행합니다.
 * @param {number} rowIndex - 선택된 셀의 행 번호 (1~5)
 * @param {string} colLetter - 선택된 셀의 열 문자 (A~E)
 */
function highlightHeaders(rowIndex, colLetter) {
    // 우선 기존에 하이라이트가 들어가 있던 모든 헤더 셀들을 찾아 강조 클래스를 제거(초기화)합니다.
    document.querySelectorAll('.header-cell').forEach(header => {
        header.classList.remove('active-header');
    });

    // 현재 선택된 열 문자(data-col)와 동일한 상단 열 헤더 요소를 찾아 클래스 추가
    const targetColHeader = document.querySelector(`.col-header[data-col="${colLetter}"]`);
    if (targetColHeader) targetColHeader.classList.add('active-header');

    // 현재 선택된 행 번호(data-row)와 동일한 좌측 행 헤더 요소를 찾아 클래스 추가
    const targetRowHeader = document.querySelector(`.row-header[data-row="${rowIndex}"]`);
    if (targetRowHeader) targetRowHeader.classList.add('active-header');
}

/**
 * 역할 4: 화면상에 입력된 모든 데이터 엘리먼트들을 순회하며 논리적인 '2차원 배열 데이터' 구조로 정밀 수집합니다.
 * @returns {Array<Array<string>>} 5x5 구조의 데이터가 담긴 2차원 배열
 */
function collectGridData() {
    const matrixData = [];

    // 가로 행 루프 (1부터 5까지)
    for (let r = 1; r <= ROW_COUNT; r++) {
        const rowData = [];
        
        // 세로 열 루프 (A부터 E까지)
        COLUMNS.forEach(col => {
            // 특정 좌표에 위치한 input 엘리먼트 검색
            const inputElement = document.querySelector(`.cell-input[data-coordinate="${col}${r}"]`);
            // 값이 있으면 입력값, 없으면 빈 공백 문자를 행 배열에 안전하게 추가
            rowData.push(inputElement ? inputElement.value : "");
        });

        // 완성된 하나의 행(1차원 배열)을 전체 메트릭스(2차원 배열)에 차곡차곡 쌓기
        matrixData.push(rowData);
    }

    return matrixData;
}

/**
 * 역할 5: 수집된 2차원 배열 데이터를 기반으로 SheetJS 라이브러리를 호출해 엑셀 파일을 최종 빌드 및 다운로드 처리합니다.
 */
function exportSpreadsheet() {
    // 1단계: 화면의 최신 데이터를 2차원 배열로 완벽하게 긁어 모읍니다.
    const structuredData = collectGridData();

    // 2단계: 엑셀 파일 다운로드 시 상단 열 제목(A, B, C, D, E) 정보도 함께 포함되도록 가공합니다.
    const excelFinalRows = [COLUMNS, ...structuredData];

    // 3단계: SheetJS 라이브러리 엔진 가동
    const workbook = XLSX.utils.book_new(); // 새 엑셀 통합 문서(파일) 개체 만들기
    const worksheet = XLSX.utils.aoa_to_sheet(excelFinalRows); // Array of Arrays(2차원 배열) 데이터를 시트로 변환

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1"); // 생성된 시트를 문서에 결합
    
    // 4단계: 브라우저 환경에 파일 쓰기 명령을 내려 실제 물리적인 'spreadsheet.xlsx'로 다운로드 실행
    XLSX.writeFile(workbook, "spreadsheet.xlsx");
}

// ==========================================
// 이벤트 핸들러 초기화 및 앱 실행 트리거
// ==========================================

// 엑셀 내보내기 버튼 클릭 시 전용 데이터 추출 및 파일화 핸들러 작동 연결
exportBtn.addEventListener('click', exportSpreadsheet);

// 브라우저 로드가 완료되는 순간 자동으로 그리드를 그리는 초기화 함수 실행
document.addEventListener('DOMContentLoaded', createGrid);
