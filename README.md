# Log Friends Console Web

> **개발 구현 기준 문서:** 최신 로컬 코드의 사용법을 설명합니다. 이 README 전용 PR에는 제품 코드·배포 변경이 포함되지 않습니다. GitHub 기본 브랜치만 clone한 경우 아래 기능·명령이 아직 일치하지 않을 수 있으며, 관련 코드 반영 후 사용해야 합니다.

Log Friends가 수집한 이벤트를 확인하고, AI와 예측 과제·부족한 데이터·검증 항목을 정리하는 웹 Console입니다.

이 저장소는 **화면과 요청 전달**을 담당합니다. 인증·앱 소유권 확인, 데이터 저장·조회, 대화 이력·프롬프트·Spring AI 호출·도구 실행은 [Kotlin Console](https://github.com/log-freind/log-friends-console)이 담당합니다. AI 로직은 Web이 아닌 Kotlin Console에 있습니다.

## 사용 흐름

1. **로그인**: 첫 화면에서 이메일·비밀번호로 로그인합니다. 가입 허용 여부는 Console 설정을 따릅니다.
2. **앱 등록과 SDK 연결**: 앱 ID·고정 Worker ID·버전을 등록하고 서버 수집 키를 발급합니다. 키는 서버 SDK의 `LOGFRIENDS_APP_KEY`로 설정합니다. 연결된 Worker가 있는 본인 앱에서 대화를 시작할 수 있습니다.
3. **수집 정책과 대화**: 데이터 카탈로그에서 API 수집을 켜거나 끄고 SDK 반영 상태를 확인합니다. 에이전트에서는 앱과 질문으로 시작해 조회 근거·예측 과제·코드 초안을 확인하고 기존 대화를 이어갑니다.

앱 키 하나는 고정 Worker 하나에 대응합니다. 연결 후 Worker 변경은 제한되며 버전 변경은 SDK 재시작 후 반영됩니다. 앱 등록·키 관리에서 키를 재발급하거나 폐기할 수 있고, 재발급하면 서버 SDK 설정도 갱신해야 합니다. 기존 앱 이름만으로 소유권을 가져오지는 않습니다.

### 화면

| 경로 | 용도 |
|---|---|
| `/` | 로그인, 에이전트 대화, 조회 근거·코드 초안·수집 제안 검토, 지원 학습 실행 화면 |
| `/log-catalog` | API 수집 ON/OFF·SDK 반영 상태·최근 24시간 HTTP 수신, 이벤트 계약·샘플·불일치 확인 |
| `/monitoring` | 트래픽·지연·이벤트 활동·오류 비교 |
| `/raw-events` | 로그인한 계정의 소유 앱 원본 이벤트 조회·필터·CSV 다운로드 |
| `/frontend-tree` | 브라우저 이벤트의 페이지·컴포넌트 위치 탐색 |
| `/investigate` | 이벤트 계약·최근 샘플을 읽기 전용으로 조사하고 조회 근거 표시 |

`/model-planning`은 에이전트의 호환 경로입니다. `/?conversation=...`과 `/model-planning?conversation=...`으로 저장된 대화를 다시 엽니다. `새 대화`는 기존 기록을 삭제하지 않습니다.

### 수집·AI 실행 경계

- API 수집 스위치는 고객 API를 호출하지 않습니다. 실제 요청에서 SDK가 데이터를 수집할지 설정하며, 현재 적용 범위는 동기 JVM Spring MVC 요청입니다. 저장과 SDK 반영은 별개이고 ACK 전에는 `반영 대기`입니다. 정상 연결에서는 다음 heartbeat까지 약 1분 걸릴 수 있습니다.
- AI의 수집 변경 제안은 자동 적용되지 않습니다. 작업 결과의 `수집` 탭에서 사용자가 승인해야 하며, 정책 버전이 바뀌면 재검토해야 합니다.
- 예측 과제는 `검증 필요`인 제안입니다. 일반 Python 코드 초안은 표시 전용이며 자동 실행하지 않습니다.
- 별도 학습·자동 개선 경로는 **지원 합성 주문 취소 예측 CPU 계약**에 한정됩니다. 데이터 검증, 서버의 코드 검사와 데이터·프로그램 해시 확인을 거쳐 사용자가 승인해야 학습 Job을 요청합니다. 자동 개선도 실험 정책·예산 승인이 필요합니다. 실행에는 Console 측 학습 실행 설정과 Kubernetes 환경이 별도로 필요합니다. 범용 AutoML, 임의 Python 실행, 일반 데이터·회귀·딥러닝, 모델 배포를 지원한다는 의미는 아닙니다.

## 로컬 실행

[package.json](package.json)의 버전은 `0.1.0`이며 릴리스 발행 여부와는 별개입니다. [package-lock.json](package-lock.json) 기준 Next.js `16.4.3`, React `19.2.4`를 사용합니다. Next.js의 Node.js 요구 조건은 `>=20.9.0`이며, [Dockerfile](Dockerfile)은 Node.js 25 이미지를 사용합니다.

먼저 [Console 실행 안내](https://github.com/log-freind/log-friends-console#readme)에 따라 DB와 Kotlin Console을 준비하세요. 아래 예시는 **Web 3000 / Console 8082 / 경로 접두사 `/logfriend`** 기준입니다. Console 기본 포트는 8080이므로 8082 실행 시 별도로 지정해야 합니다.

Console의 로컬 실행 설정:

| 설정 | 이 예시의 값 |
|---|---|
| `SERVER_PORT` | `8082` |
| `logfriends.account.allowed-origins` | `http://localhost:3000` (코드 기본은 localhost·127.0.0.1의 3002 포트) |
| `logfriends.account.secure-cookie` | 로컬 HTTP 테스트에서만 `false` (기본 `true`) |
| `logfriends.account.signup-enabled` | 로컬에서 가입이 필요할 때만 `true` (기본 `false`) |

계정 설정은 Console 실행 시 `--logfriends.account.allowed-origins=http://localhost:3000` 같은 Spring Boot 인수로 지정할 수 있습니다. 운영에서는 HTTPS·Secure 쿠키·가입 정책을 별도로 설정하세요.

Web 저장소에서 실행합니다.

```bash
npm ci
NEXT_PUBLIC_CONSOLE_API_BASE_URL=/console-api \
CONSOLE_API_PROXY_TARGET=http://localhost:8082/logfriend \
npm run dev -- --port 3000
```

[http://localhost:3000](http://localhost:3000)을 엽니다. 포트가 사용 중이면 Web 포트와 Console의 허용 Origin을 함께 바꾸세요. SDK 연결 예시는 [Examples](https://github.com/log-freind/log-friends-examples)를 참고하세요.

## API 연결 설정

| 환경변수 | 역할과 기본값 |
|---|---|
| `NEXT_PUBLIC_CONSOLE_API_BASE_URL` | 브라우저 API 주소. 코드 기본 `http://localhost:8080/logfriend`, 위 예시는 같은 출처의 `/console-api` 사용 |
| `CONSOLE_API_PROXY_TARGET` | Next.js가 요청을 전달할 Kotlin Console 주소. 코드 기본 `http://localhost:8080/logfriend` |
| `CONSOLE_API_BASE_URL` | runtime config 생성 스크립트의 브라우저 API 주소. 미지정 시 `NEXT_PUBLIC_CONSOLE_API_BASE_URL`, 그다음 `/console-api` |

설정 예시는 개발 작업 트리의 `.env.example`, 브라우저 주소 적용 순서는 [env.ts](src/lib/config/env.ts)를 참고하세요. 계정·원본 이벤트 요청은 항상 `/console-api`를 사용하고 에이전트 요청은 Next.js API를 거칩니다. 브라우저 API 주소를 직접 지정해도 Next.js 서버와 프록시 설정이 필요합니다. Console에 직접 요청하는 화면은 `LOGFRIENDS_WEB_ALLOWED_ORIGINS`도 실제 Web Origin과 맞춰야 합니다.

### 빌드 후 실행

`/console-api`의 rewrite 대상은 빌드 시 고정되고, 에이전트 전달 API는 실행 시 환경변수를 읽습니다. **빌드와 실행에 같은 `CONSOLE_API_PROXY_TARGET`을 지정**하고, 대상이 바뀌면 재빌드하세요.

```bash
NEXT_PUBLIC_CONSOLE_API_BASE_URL=/console-api \
CONSOLE_API_PROXY_TARGET=http://localhost:8082/logfriend npm run build
CONSOLE_API_PROXY_TARGET=http://localhost:8082/logfriend npm run start -- --port 3000
```

실행 명령은 `next start`이며 정적 파일만으로 배포할 수 없습니다. 빌드에는 개발 의존성과 현재 Google 폰트 다운로드 연결이 필요합니다.

Docker는 빌드 인수와 실행 환경의 `CONSOLE_API_PROXY_TARGET` 모두 `http://log-friends-console:8080/logfriend`를 기본으로 사용합니다. 대상을 바꾸면 빌드 인수와 실행 환경을 함께 변경하세요. 컨테이너는 시작 시 [스크립트](scripts/write-runtime-config.mjs)로 `public/runtime-config.js`를 생성하며, 기본 브라우저 API 주소는 `/console-api`입니다. runtime config는 빌드 시 브라우저 주소보다 우선하지만 rewrite 대상은 바꾸지 않습니다. 일반 `npm run start`는 이 스크립트를 자동 실행하지 않습니다.

## 보안과 제한

- **모델 키는 Kotlin Console에만 설정**합니다. `OPENAI_API_KEY`·`LOGFRIENDS_AGENT_MODEL`은 Web에 필요하지 않습니다. 서버 SDK 앱 키도 브라우저 SDK·클라이언트 코드·`NEXT_PUBLIC_*`·runtime config·대화에 넣지 마세요.
- 앱 키 원문은 발급 직후 화면에서만 확인하며 기본 마스킹됩니다. Web은 이를 localStorage나 sessionStorage에 저장하지 않습니다. 로그인은 HttpOnly 세션 쿠키를 사용하며 화면에 접근 토큰을 입력하지 않습니다.
- 대화 내용과 조회 근거 일부는 모델 API에 전달됩니다. 예측 과제 제안에는 원본 샘플 값 대신 관찰된 필드명·타입·횟수를 전달하지만, 이벤트 조사 등 다른 조회의 범위까지 동일하다고 가정하면 안 됩니다. 계약 설명·필드명·질문에도 민감 정보가 없는지 확인하세요.
- 에이전트 전달 경로는 세션 쿠키와 요청 Origin을 검사하고, Console이 인증·앱 소유권을 검증합니다. 역방향 프록시는 브라우저 `Host`를 보존하고 HTTPS 종료 시 올바른 `X-Forwarded-Proto`를 설정해야 합니다. `X-Forwarded-Host`만으로 출처 검사를 우회하지 않습니다.
- 로그인과 일부 소유권 검증이 전체 API의 접근 제어 완료를 뜻하지 않습니다. 외부 공개 전 관리·통계·MCP를 포함한 전체 경로를 점검해야 합니다. Web 에이전트는 Console 내부 조회 서비스를 사용하므로 MCP HTTP 활성화가 필요하지 않습니다.
- 합성 데이터 학습 결과는 운영 성능을 보장하지 않습니다. Frontend Tree는 SDK의 `uiContext`를 사용하며 React·DOM 트리를 자동 분석하지 않습니다. 이벤트 수집 횟수는 매출·거래 완료 수가 아니고, 코드 힌트는 확정된 LogSpec이 아닙니다.

## 개발 및 참고

```bash
npm run lint
npm test
```

빌드는 위의 API 설정을 포함한 명령으로 실행하세요. 추가 타입 검사는 빌드가 끝난 뒤 `npx tsc --noEmit --incremental false`로 실행합니다. 빌드와 동시에 실행하면 `.next/types` 생성과 충돌할 수 있습니다.

화면은 Next.js·React, API 상태는 TanStack Query, 화면 상태는 Zustand를 사용합니다. [화면 코드](src/features), [API 코드](src/lib/api), 에이전트 요청 전달용 `src/features/model-planning/server-storage.ts`(개발 코드 경로)을 참고하세요.

상위 작업공간의 `docs/console/`에는 `app-registration.md`, `api-collection-control.md`, `collection-agent.md`, `spring-ai-conversation.md`, `ai-generated-training.md`가 있습니다. 이들은 **로컬 전용 참고 경로**이며, 이 저장소만 clone한 환경이나 GitHub README에서는 제공되지 않습니다.

[Console](https://github.com/log-freind/log-friends-console) · [Examples](https://github.com/log-freind/log-friends-examples) · [Apache-2.0](LICENSE)
