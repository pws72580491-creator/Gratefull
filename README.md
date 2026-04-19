# 🌿 Grateful — 감사노트

> 매일의 감사를 기록하는 아름다운 PWA 앱

**배포 URL:** `https://pws72580491-creator.github.io/geatefull`

---

## 📱 앱 설치 방법

### Android (Chrome)
1. 위 URL 접속
2. 주소창 오른쪽 ⋮ 메뉴 → **홈 화면에 추가**
3. 추가 버튼 탭

### iPhone (Safari)
1. 위 URL 접속
2. 하단 공유 버튼 → **홈 화면에 추가**
3. 추가 버튼 탭

---

## ✨ 주요 기능

- 📝 매일 감사 최대 5가지 기록
- 😊 오늘 기분(무드) 트래킹
- 📅 캘린더 & 히스토리 뷰
- 🔥 연속 기록 스트릭
- 🏆 7일 → 21일 → 30일 감사 챌린지
- 📊 연간 리와인드 통계
- 🌙 라이트 / 다크 / 세피아 / 오로라 테마
- 🔤 다양한 한국어 폰트 선택
- 🔔 매일 알림 (백그라운드 서비스 워커)
- ☁️ Firebase 실시간 그룹 피드
- 📤 JSON 백업 & 복원

---

## 🗂️ 파일 구조

```
geatefull/
  ├── index.html           # 앱 본체
  ├── sw.js                # 서비스 워커 (알림 + 오프라인 캐시)
  ├── manifest.json        # PWA 설치 정보
  ├── .nojekyll            # GitHub Pages Jekyll 비활성화
  ├── icon-192.png         # 앱 아이콘 192×192
  ├── icon-512.png         # 앱 아이콘 512×512
  ├── icon-maskable.png    # 마스크 가능 아이콘
  └── apple-touch-icon.png # iOS 홈화면 아이콘
```

---

## 🔧 기술 스택

- **Frontend:** 단일 HTML PWA (Vanilla JS)
- **Database:** Firebase Realtime Database (`grateful-c4abc`)
- **배포:** GitHub Pages
- **서비스 워커:** 오프라인 캐시 + 백그라운드 알림
- **폰트:** Google Fonts (Noto Serif KR, DM Serif Display 외)

---

## 📋 버전 이력

### v3.18 (2026.03.15) — 현재
- 그룹 피드 필터 개선 (작성자별, 기간별)
- 익명 공유 기능 추가
- 피드 무한 스크롤 개선
- 클라우드 동기화 안정성 향상

### v3.x
- 연간 리와인드 기능 추가
- 30일 챌린지 스테이지 시스템 (7일→21일→30일)
- 다크 모드 / 오로라 테마 추가
- 백그라운드 알림 서비스 워커 분리

### v2.x
- Firebase 그룹 피드 기능 추가
- 닉네임 및 익명 공유 시스템
- 무드(기분) 트래킹 추가
- 한국어 폰트 선택 기능

### v1.x
- 기본 감사 기록 기능
- 로컬 저장소(localStorage) 기반
- 캘린더 히스토리 뷰
- 연속 기록 스트릭

---

## ⚙️ Firebase 설정

```
프로젝트: grateful-c4abc
Realtime Database: asia-southeast1
```

Firebase Console → Realtime Database → 규칙:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

---

Made with 🌿 for a more thankful day
