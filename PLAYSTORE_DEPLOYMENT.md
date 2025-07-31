# 구글 플레이 스토어 배포 가이드

## 사전 요구사항 체크리스트

### PWA 필수 요구사항
- [x] HTTPS로 서비스 제공 (Vercel 배포 시 자동)
- [x] Service Worker 구현 완료
- [x] Web App Manifest 파일 존재
- [x] 192x192 아이콘 존재
- [x] 512x512 아이콘 존재
- [ ] Lighthouse 점수 80/100 이상

### 추가 준비사항
- [ ] 구글 플레이 개발자 계정 ($25 일회성 비용)
- [ ] 앱 서명 키
- [ ] 스크린샷 (각 디바이스 크기별)
- [ ] 앱 설명 및 메타데이터

## 배포 방법 선택

### 옵션 1: PWABuilder (추천) ⭐
가장 쉽고 빠른 방법입니다.

1. https://www.pwabuilder.com 접속
2. 배포된 URL 입력 (예: https://your-app.vercel.app)
3. 점수 확인 후 "Build My PWA" 클릭
4. Android 패키지 다운로드

### 옵션 2: Bubblewrap CLI
더 많은 제어가 필요한 경우 사용합니다.

```bash
# 설치
npm install -g @bubblewrap/cli

# 프로젝트 초기화
bubblewrap init --manifest https://your-app.vercel.app/manifest.json

# APK 빌드
bubblewrap build
```

### 옵션 3: Android Studio (수동)
최대한의 커스터마이징이 필요한 경우 사용합니다.

## 디지털 에셋 링크 설정

TWA가 작동하려면 앱과 웹사이트 간의 소유권을 증명해야 합니다.

1. SHA-256 지문 생성 (APK 서명 후 얻을 수 있음)
2. `public/.well-known/assetlinks.json` 파일 생성
3. 다음 내용 추가:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.yourcompany.voicediary",
    "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT"]
  }
}]
```

## 구글 플레이 콘솔 업로드

1. https://play.google.com/console 접속
2. 새 앱 생성
3. 앱 정보 입력:
   - 앱 이름: 울림 - 마음을 담는 음성 일기
   - 기본 언어: 한국어
   - 앱/게임: 앱
   - 무료/유료: 무료

4. 스토어 등록정보 작성:
   - 간단한 설명 (80자)
   - 자세한 설명 (4000자)
   - 스크린샷 업로드
   - 아이콘 업로드
   - 카테고리 선택

5. APK/AAB 업로드:
   - 프로덕션 트랙에 업로드
   - 테스트 진행
   - 검토 제출

## 필요한 스크린샷

- 휴대전화: 최소 2개 (권장 8개)
- 7인치 태블릿: 최소 1개
- 10인치 태블릿: 최소 1개

## 예상 시간

- PWABuilder로 APK 생성: 10분
- 구글 플레이 콘솔 설정: 1-2시간
- 구글 검토 및 승인: 2-3일

## 주의사항

1. 첫 배포 시 internal testing track 사용 권장
2. 실제 디바이스에서 충분히 테스트
3. 오프라인 기능 동작 확인
4. 권한(마이크) 요청 흐름 테스트