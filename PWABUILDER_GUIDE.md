# PWABuilder를 사용한 APK 생성 가이드

## 🚀 PWABuilder로 APK 생성하기 (가장 쉬운 방법)

### 1. 사전 준비
- Vercel에 앱이 배포되어 있어야 함
- HTTPS URL 필요 (예: https://your-voice-diary.vercel.app)

### 2. PWABuilder 사용하기

1. **PWABuilder 접속**
   - https://www.pwabuilder.com 방문

2. **URL 입력**
   - 배포된 PWA URL 입력
   - "Start" 버튼 클릭

3. **점수 확인**
   - PWA 점수가 표시됨
   - 80점 이상이어야 함
   - 부족한 부분이 있다면 수정 필요

4. **패키지 생성**
   - "Build My PWA" 클릭
   - Android 선택
   - 다음 옵션 설정:
     - **Package ID**: `com.yourcompany.voicediary` (변경 가능)
     - **App name**: 울림
     - **App version**: 1.0.0
     - **Display mode**: Standalone (이미 manifest에 설정됨)

5. **고급 설정**
   - **Signing key**: 
     - "Use mine" 선택하여 자체 키 사용 (권장)
     - 또는 PWABuilder가 생성하도록 선택
   - **Splash screen**: 자동 생성 옵션 사용
   - **Settings**:
     - Notification delegation: Enabled (푸시 알림 사용 시)
     - Location delegation: Disabled
     - Google Play Billing: Disabled (무료 앱)

6. **다운로드**
   - "Download" 버튼 클릭
   - ZIP 파일 다운로드
   - 압축 해제

### 3. 다운로드된 파일 구조

```
your-app.zip
├── app-release-signed.aab  # Play Store 업로드용
├── app-release-signed.apk  # 테스트용
├── signing-key-info.txt    # 서명 키 정보
└── assetlinks.json        # 디지털 에셋 링크
```

### 4. 중요: Digital Asset Links 설정

1. 다운로드한 `assetlinks.json` 파일 내용 확인
2. SHA256 fingerprint 복사
3. 프로젝트의 `public/.well-known/assetlinks.json` 업데이트:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.yourcompany.voicediary",
    "sha256_cert_fingerprints": ["여기에_복사한_SHA256_붙여넣기"]
  }
}]
```

4. 변경사항 커밋 및 재배포

### 5. 테스트

1. **로컬 테스트**
   ```bash
   # Android 기기에서 개발자 모드 활성화
   # USB 디버깅 허용
   adb install app-release-signed.apk
   ```

2. **테스트 항목**
   - 앱 설치 및 실행
   - 음성 녹음 기능
   - 오프라인 모드
   - 푸시 알림 (설정한 경우)

### 6. 문제 해결

**"Digital Asset Links 검증 실패" 오류**
- assetlinks.json이 올바른 경로에 있는지 확인
- SHA256 fingerprint가 정확한지 확인
- 파일이 공개적으로 접근 가능한지 확인:
  ```
  https://your-app.vercel.app/.well-known/assetlinks.json
  ```

**"Package name already exists" 오류**
- 다른 package ID 사용 (예: `com.yeonjin.voicediary`)

### 7. 다음 단계

APK/AAB 파일이 준비되면:
1. Google Play Console에서 새 앱 생성
2. 내부 테스트 트랙에 먼저 업로드
3. 충분한 테스트 후 프로덕션 배포

## 📱 권장사항

- 첫 배포는 항상 내부 테스트로 시작
- 실제 기기에서 충분히 테스트
- 사용자 피드백 수집 후 개선
- 정기적인 업데이트로 사용자 신뢰 구축