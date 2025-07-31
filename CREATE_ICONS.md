# 아이콘 생성 가이드

## 필요한 아이콘 크기

PWABuilder와 구글 플레이 스토어를 위해 다음 크기의 아이콘이 필요합니다:

- 144x144 (PWABuilder 최소 요구사항)
- 192x192 (이미 있음)
- 512x512 (이미 있음)

## 아이콘 생성 방법

### 온라인 도구 사용 (추천)
1. https://www.pwabuilder.com/imageGenerator 접속
2. 512x512 아이콘 업로드
3. 모든 크기 자동 생성

### 로컬에서 생성
```bash
# ImageMagick 설치 (Ubuntu/WSL)
sudo apt-get install imagemagick

# 144x144 아이콘 생성
convert public/icons/icon-512.png -resize 144x144 public/icons/icon-144.png
```

### Maskable 아이콘
- Maskable 아이콘은 여백이 필요합니다
- 안전 영역: 아이콘 중앙 80%
- https://maskable.app/editor 에서 테스트 가능

## 아이콘 파일 위치
```
public/icons/
├── icon-144.png  # 생성 필요
├── icon-192.png  # ✓ 있음
└── icon-512.png  # ✓ 있음
```