# 아이콘 생성 가이드

Voice Diary 앱의 아이콘을 생성하는 방법입니다.

## 필요한 아이콘 크기

### PWA용 아이콘
- 192x192 PNG (필수)
- 512x512 PNG (필수)

### Google Play Store용 아이콘
- 512x512 PNG (고해상도, 알파 채널 포함)

## 아이콘 생성 방법

### 방법 1: PWA Builder Image Generator (추천)
1. https://www.pwabuilder.com/imageGenerator 접속
2. 512x512 PNG 파일 하나 업로드
3. 자동으로 모든 크기 생성
4. 다운로드 후 `/public/` 폴더에 배치

### 방법 2: RealFaviconGenerator
1. https://realfavicongenerator.net/ 접속
2. favicon.ico 또는 고해상도 이미지 업로드
3. 다양한 플랫폼용 아이콘 생성
4. 필요한 크기만 선택하여 다운로드

### 방법 3: 온라인 도구들
- https://favicon.io/favicon-converter/
- https://www.favicon-generator.org/
- https://iconifier.net/

## 파일 배치

생성된 아이콘 파일들을 다음 위치에 저장하세요:

```
public/
├── favicon.ico (32x32)
├── icon-192.png (192x192)
└── icon-512.png (512x512)
```

## manifest.json 업데이트

아이콘 파일을 추가한 후 `/public/manifest.json`의 icons 섹션이 올바른지 확인하세요:

```json
"icons": [
  {
    "src": "/favicon.ico",
    "sizes": "32x32",
    "type": "image/x-icon"
  },
  {
    "src": "/icon-192.png",
    "sizes": "192x192",
    "type": "image/png",
    "purpose": "any maskable"
  },
  {
    "src": "/icon-512.png",
    "sizes": "512x512",
    "type": "image/png",
    "purpose": "any maskable"
  }
]
```

## 아이콘 디자인 팁

1. **단순한 디자인**: 작은 크기에서도 알아볼 수 있도록
2. **대비가 높은 색상**: 어두운/밝은 배경 모두에서 잘 보이도록
3. **둥근 모서리**: 다양한 플랫폼의 마스킹에 대비
4. **여백 확보**: 아이콘 주변에 충분한 여백 (전체 크기의 10-15%)

## 테스트

아이콘이 제대로 적용되었는지 확인:
1. 브라우저 탭의 파비콘
2. PWA 설치 시 아이콘
3. 홈 화면에 추가된 아이콘
4. manifest.json 검증: Chrome DevTools > Application > Manifest