# Bluegrain 웹사이트 A/B 테스트 프로젝트

이 프로젝트는 가상의 의류 브랜드 'Bluegrain'의 메인 페이지 전환율 개선을 위한 A/B 테스트를 구현한 것입니다.

- **A안 (기능성 강조)**: 제품의 기술적 특징과 퍼포먼스 측면을 강조하여 사용자의 신뢰를 얻고자 합니다.
- **B안 (라이프스타일 강조)**: 제품이 사용자의 일상에 어떻게 녹아드는지 감성적인 이미지로 보여주어 공감대를 형성하고자 합니다.

> **포트폴리오 핵심 포인트**:
> 이 프로젝트는 단순히 두 가지 버전의 페이지를 만드는 것을 넘어, 코드의 **재사용성**과 **유지보수성**을 어떻게 고민했는지를 보여주는 데 중점을 두었습니다.
> - 공통 CSS/JavaScript 모듈화를 통해 중복 코드를 최소화했습니다.
> - 인라인 스타일과 스크립트를 외부 파일로 완전히 분리하여 관심사 분리 원칙을 준수했습니다.
> - Firebase Firestore를 연동하여 각 버전의 페이지 노출 수(View)와 클릭 수(Click)를 수집하는 데이터 기반 테스트 환경을 구축했습니다.

## 🚀 주요 기능

- **A/B 페이지 분기 처리**: 사용자가 처음 접속 시 50% 확률로 A 또는 B 페이지로 랜덤하게 리디렉션됩니다.
- **데이터 수집**: 각 페이지의 노출 수, 주요 버튼 클릭 수를 Firebase Firestore에 기록합니다.
- **공통 UI 컴포넌트**: 모달, 사이드바 등 공통 UI 요소들을 모듈화하여 관리합니다.
- **Google 계정 인증**: Firebase Authentication을 이용한 간편 로그인/로그아웃 기능을 구현했습니다.

## 🛠️ 사용 기술

- **Frontend**: HTML5, CSS3, JavaScript (ESM)
- **Backend & Database**: Firebase (Firestore, Authentication)
- **Build Tool**: Vite (개발 서버 및 프로덕션 빌드)

## ⚙️ 실행 방법

1.  **저장소 복제**
    ```bash
    git clone https://github.com/your-username/Bluegrain-ABtest.git
    cd Bluegrain-ABtest
    ```

2.  **의존성 설치**
    ```bash
    npm install
    ```

3.  **개발 서버 실행**
    ```bash
    npm run dev
    ```
    이후 브라우저에서 `http://localhost:5173` (또는 터미널에 표시된 주소)로 접속하세요.