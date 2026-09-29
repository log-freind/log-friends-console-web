# Log Friends Console Web

Log Friends가 수집한 이벤트의 **설명, 실제 데이터, 불일치**를 확인하는 웹 화면입니다.
데이터 엔지니어와 백엔드 엔지니어가 같은 이벤트를 보며 이야기할 수 있도록 구성했습니다.

이 저장소는 화면만 담당합니다. 데이터 저장과 조회는 [Console API](https://github.com/log-freind/log-friends-console)가 수행합니다.

## 화면 안내

| 화면 | 용도 |
|---|---|
| Overview `/` | 같은 기간의 트래픽, 지연, 이벤트 활동, 오류 비교 |
| Log Catalog `/log-catalog` | 앱별 이벤트 설명, 코드 힌트, 계약 필드, 실제 샘플과 mismatch 확인 |
| Raw Events `/raw-events` | 이벤트 필터링, 세션별 조회, CSV 다운로드 |
| Frontend Tree `/frontend-tree` | 수집된 브라우저 이벤트를 페이지·컴포넌트 위치별로 탐색 |

## 로컬 실행

Node.js와 npm이 필요합니다. 저장소의 기존 실행 기준은 Node.js 25+, npm 11+입니다.
먼저 Console을 `http://localhost:8080`에서 실행하세요.

```bash
npm ci
NEXT_PUBLIC_CONSOLE_API_BASE_URL=/console-api \
CONSOLE_API_PROXY_TARGET=http://localhost:8080 \
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다.
위 설정은 Next.js가 Console로 요청을 전달하도록 합니다.

데이터가 없다면 [Examples](https://github.com/log-freind/log-friends-examples)의 상품 화면을 사용한 뒤
Raw Events에서 `catalogProductsListed`를 조회하세요.

## API 연결 설정

| 설정 | 용도 |
|---|---|
| `NEXT_PUBLIC_CONSOLE_API_BASE_URL` | 브라우저가 호출할 API 주소. 기본 `http://localhost:8080` |
| `CONSOLE_API_PROXY_TARGET` | `/console-api` 요청을 전달할 Console 주소 |
| `CONSOLE_API_BASE_URL` | 컨테이너 시작 시 생성되는 runtime config의 API 주소 |

컨테이너 runtime config가 있으면 빌드 시 지정한 주소보다 우선합니다.
설정 예시는 [.env.example](.env.example), 적용 순서는 [env.ts](src/lib/config/env.ts)를 참고하세요.

Console에 직접 접속하도록 설정했다면, Console의
`LOGFRIENDS_WEB_ALLOWED_ORIGINS`에 웹 화면의 origin을 허용해야 합니다.

## 알아둘 점

- 코드 힌트와 확정된 LogSpec은 다릅니다. 필드 요청 생성 UI는 없으며 현재 화면에서는 요청 수를 확인합니다.
- Frontend Tree는 SDK가 보낸 `uiContext`를 사용합니다. React나 DOM 트리를 자동 분석하지 않습니다. 조회 최대 500건 범위의 결과입니다.
- Event Activity의 횟수는 이벤트 수집 횟수이지 매출이나 거래 완료 수가 아닙니다.
- 인증·권한 관리는 아직 제공하지 않습니다. 외부 공개 전 별도 접근 제어가 필요합니다.

## 개발 및 확인

```bash
npm run lint
npm test
npm run build
npm run start
```

Next.js와 React로 화면을 구성하고, TanStack Query로 API 데이터를, Zustand로 화면 상태를 관리합니다.
API 코드는 [src/lib/api](src/lib/api), 화면 코드는 [src/features](src/features)에 있습니다.

[Console](https://github.com/log-freind/log-friends-console) ·
[Examples](https://github.com/log-freind/log-friends-examples) · [Apache-2.0](LICENSE)
