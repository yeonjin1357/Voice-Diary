#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 아이콘 생성을 위한 스크립트
// 실제로는 sharp나 jimp 같은 라이브러리를 사용해야 하지만,
// 현재는 favicon.ico를 복사하는 것으로 대체

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconDir = path.join(__dirname, '../public/icons');

// icons 디렉토리가 없으면 생성
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

console.log('아이콘 생성 가이드:');
console.log('1. https://realfavicongenerator.net/ 접속');
console.log('2. favicon.ico 업로드');
console.log('3. 다양한 크기의 PNG 아이콘 다운로드');
console.log('4. public/icons 폴더에 다음 파일들 저장:');
sizes.forEach(size => {
  console.log(`   - icon-${size}x${size}.png`);
});

console.log('\n또는 다음 도구 사용:');
console.log('- https://www.pwabuilder.com/imageGenerator');
console.log('- 512x512 PNG 하나만 업로드하면 모든 크기 생성');