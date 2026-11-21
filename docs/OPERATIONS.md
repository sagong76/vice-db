# VICE.DB 운영 가이드

## 1. 구조 한눈에 보기

```
Google Sheet (Vehicles, Map_Pins)  ──┐
images-src/vehicles/<id>.png       ──┼─▶ npm run build ─▶ dist/ (정적 HTML 74+페이지, sitemap.xml) ─▶ Netlify
                                     │   ① fetch-data   시트 → src/data/*.json
                                     │   ② process-images  스크린샷 → WebP 1280/640
                                     └   ③ vite build + prerender  페이지별 HTML·메타·sitemap
```

- 시트를 고친 뒤 **배포(빌드)가 한 번 돌아야** 사이트에 반영됩니다. 아래 "4. 자동 배포"를 설정하면 매일 자동 반영됩니다.
- 시트 다운로드가 실패해도 마지막으로 커밋된 `src/data/*.json`으로 빌드는 계속 성공합니다.

## 2. 시트 컬럼

### Vehicles 탭
| 컬럼 | 필수 | 설명 |
|---|---|---|
| id | ✅ | URL이 됩니다 (`/vehicles/<id>/`). **한번 정하면 바꾸지 마세요** (검색 순위가 초기화됨). 소문자-하이픈 |
| name, manufacturer, class, real_car | ✅ | name에 제조사를 포함해도 됩니다 (중복 표시 안 됨) |
| price, speed, accel, handling | | 숫자. 성능은 0~100 |
| free_spawn, pin_id | | Yes/No, Map_Pins의 pin_id |
| description | | **차별화 포인트.** 2~4문장, 직접 몰아본 느낌·용도·팁 |
| **verified** | 추가 | `Yes` = 게임에서 직접 확인 or 신뢰 출처 2곳. 비우면 "Unverified" 경고 표시 |
| **source_url** | 추가 | 미검증일 때 근거 링크 |
| **updated** | 추가 | `2026-11-21` 형식. sitemap lastmod에 사용 |
| **image_credit** | 추가 | 직접 찍은 사진이 아닐 때만 (예: `Rockstar Games Newswire`) |
| image_url | ❌ 사용 안 함 | 실물차 스톡사진은 더 이상 표시하지 않음. 열 삭제해도 됨 |

### Map_Pins 탭
기존 컬럼 + **verified** (Yes/비움).

## 3. 차량 이미지 (Xbox)

1. 게임 포토모드에서 촬영. **규칙: 차 측면 3/4 앞각도, 낮 시간, 차가 화면 중앙, HUD 끄기.** 16:9로 중앙 자동 크롭됩니다.
2. Xbox 설정 → 환경설정 → 캡처 및 공유 → **OneDrive 자동 업로드** 켜기. (캡처 해상도는 1080p SDR 권장: 파일이 작음)
3. PC/폰에서 OneDrive의 캡처 파일을 **차량 id로 이름 변경** (`grotti-cheetah.png`).
4. GitHub 저장소 → `images-src/vehicles/` → Add file → Upload files → Commit.
5. Netlify가 자동 빌드 → 해당 차량 페이지·카드·og:image에 반영.

> 한 번에 10~20대씩 몰아서: 차고/딜러에서 연속 촬영 → 이름 변경 → 한 번에 업로드.
> 금지: 실물 자동차 사진, AI 생성 이미지, 타 사이트·위키 이미지 복사.

## 4. 자동 정보 수집 + 자동 배포 (GitHub Actions)

`.github/workflows/daily-updates.yml`이 **매일 05:17 (KST)** 실행됩니다.

1. 시트 최신 데이터를 받아
2. GTA Wiki(gta.wiki, Fandom)의 GTA VI 차량 목록·최근 수정, Google News(최근 2일)와 비교해
3. GitHub 이슈 **"📋 GTA 6 updates 날짜"** 를 만듭니다 (이전 이슈는 자동 닫힘). GitHub 앱 알림을 켜면 폰으로 받습니다.
   - 🆕 위키에 있는데 DB에 없는 차량 (전날 이후 새로 생긴 것만)
   - ✏️ DB 차량의 위키 문서가 최근 48시간 내 실질 수정됨 (서식·오타 수정 제외) → 가격·스펙 변경 확인
   - 📰 최근 2일 뉴스
   - ❓ DB에 있는데 어느 위키에도 없는 차량 → 가짜/추측 데이터일 가능성, 확인 후 삭제 또는 이름 수정
4. 같은 시각 Netlify 빌드를 트리거해 **전날 시트 수정이 자동 반영**됩니다.

### 자동 배포 1회 설정
1. Netlify → Site configuration → Build & deploy → **Build hooks** → Add build hook (이름: daily) → URL 복사
2. GitHub 저장소 → Settings → Secrets and variables → Actions → New repository secret
   - Name: `NETLIFY_BUILD_HOOK` / Secret: 복사한 URL
3. 급할 때: Actions 탭 → "Daily GTA 6 updates" → Run workflow (수집+배포 즉시 실행)

> 위키 내용은 **확인용 링크**로만 씁니다. 위키 문장을 시트에 복사하지 말고, 사실(가격·제조사 등)만 확인해 직접 쓰세요.

## 5. 하루 루틴 (10~15분)

1. 아침에 오늘의 업데이트 이슈 열기
2. 🆕 항목 중 실제 게임에서 본 차량부터 시트에 추가 (id 규칙: `제조사-모델`, 소문자-하이픈)
3. ✏️ 항목은 링크 열어 가격·분류 변화만 확인 → 시트 수정, `updated` 날짜 갱신
4. 직접 확인한 항목 `verified=Yes`, 플레이 중 찍은 스크린샷 업로드
5. 처리한 항목 체크 → 다음날 05:17 자동 배포
6. 주 1회: Search Console 실적 확인 → 검색 들어오는 차량의 description 보강

## 6. 애드센스 신청 체크리스트

- [ ] 이 변경사항 배포 후 Search Console에 `https://gta6vicedb.com/sitemap.xml` 제출
- [ ] 차량 30대 이상 `verified=Yes` + 직접 스크린샷 + description 3문장 이상
- [ ] About / Privacy / Terms / Contact 페이지 확인 (About의 운영자 소개를 본인 상황에 맞게 수정)
- [ ] Search Console에 색인된 페이지가 수십 개 이상 보일 때 신청
- [ ] 승인 후: `public/ads.txt` 추가 (`google.com, pub-XXXXXXXX, DIRECT, f08c47fec0942fa0`), `AdSlot.tsx`에 광고 코드 연결
