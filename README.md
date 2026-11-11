# EVESEL | 반응형 메인 홈페이지

Penpot **01 / HOME / Desktop 1920**, **01 / HOME / Mobile 390** 시안을 기반으로 한 이브셀 메인페이지입니다.

## 구성

- 순수 HTML / CSS / JavaScript (프레임워크, 빌드 도구 없음)
- PC 1920px 및 모바일 390px 디자인 기준 반응형 (중간 너비 대응)
- 히어로, 브랜드/제품 자동 롤링, 4개 제품 카테고리, OEM/ODM, 제조 역량, R&D, 문의, 푸터
- Penpot 원본 이미지 리소스 `assets/` 포함
- 스크롤 반응형 헤더, 전체 메뉴, KR/EN 텍스트 전환, 자동 롤링, 모션 감소 접근성 대응
- Pretendard 웹폰트는 공식 배포 CDN을 통해 불러옵니다. 폰트 요청에 실패하면 OS 기본 한글 글꼴로 표시됩니다.

## 실행

`index.html` 파일을 브라우저로 열거나 아래 명령어로 로컬 서버를 실행합니다.

```bash
python3 -m http.server 8000
```

그다음 `http://localhost:8000`으로 접속합니다.

## 파일 구조

```text
index.html
css/style.css
js/main.js
assets/        # Penpot에서 추출한 원본 이미지 25개
README.md
```

현재 작업 범위는 **메인페이지 1개**입니다. 내비게이션은 메인페이지의 해당 섹션으로 이동하며 별도 서브페이지는 아직 구현하지 않았습니다. 문의 버튼은 담당 이메일로 연결됩니다.

## 폰트 자체 호스팅 옵션

현재 스타일시트는 Pretendard 공식 CDN을 사용합니다. 제공받은 OTF를 자체 호스팅하려면 `fonts/` 디렉터리로 저장한 뒤 `css/style.css`의 상단 폰트 import를 로컬 `@font-face` 선언으로 변경하면 됩니다.
