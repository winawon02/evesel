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

## 2026-11-11 영상·제품 컬러 갤러리 업데이트

- `js/experience.js` / `css/experience.css`: 히어로 영상 제어, PC·모바일 스크롤 리빌/패럴랙스, 컬러 그룹 갤러리(좌우 버튼/터치/키보드), 스크롤 진행 표시.
- `index.html`: 히어로에서 `assets/hero-loop.mp4`를 자동재생·무음·반복·인라인 배경으로 사용하고 `assets/hero-poster.webp`를 포스터로 표시합니다.
- `assets/media-manifest.json`: ZIP 원본 38종을 패키지 색상 기준 5개 그룹으로 배치한 순서입니다.
- 움직임 줄이기 설정에서는 애니메이션을 비활성화하고, 데이터 절약 설정에서는 영상 재생을 생략합니다.
- 참고 사이트 동남기업의 스크롤 모션을 디자인 방향으로 참고하되 기술적으로 의존하지 않는 순수 JavaScript + CSS 구현입니다.

**미디어 파일 업로드 필요:** GitHub 커넥터가 이 작업의 MP4/WebP 바이너리 파일을 직접 전송할 수 없어 코드와 매니페스트만 먼저 커밋했습니다. 별도로 제공된 `EVESEL_media_assets.zip`을 압축 해제하여 저장소 루트에 `assets/` 구조를 그대로 복사한 후 아래를 실행하세요.

```sh
git add assets/hero-loop.mp4 assets/hero-poster.webp assets/products
git commit -m "assets: add hero film and 38 product photos"
git push origin main
```

미디어가 없더라도 기존 `hero.jpg` 배경 및 `product-01.png` 등 기존 제품 이미지로 대체 표시되도록 구성했습니다. **그러나 실제 첨부 영상 및 38종 이미지는 위 바이너리 업로드를 완료해야 공개 사이트에 표시됩니다.**
