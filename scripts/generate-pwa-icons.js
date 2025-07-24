const fs = require('fs')
const path = require('path')

// Simple SVG icon for diet app
const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#0a0a0a"/>
  <text x="256" y="280" font-family="system-ui, -apple-system, sans-serif" font-size="300" text-anchor="middle" fill="white">🎙️</text>
</svg>
`

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '..', 'public', 'icons')
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

// For now, create placeholder files
const sizes = [72, 96, 128, 144, 152, 192, 384, 512]

// Create a simple placeholder for each size
sizes.forEach(size => {
  const placeholderSvg = svgIcon.replace('width="512"', `width="${size}"`).replace('height="512"', `height="${size}"`)
  const filename = path.join(iconsDir, `icon-${size}x${size}.svg`)
  fs.writeFileSync(filename, placeholderSvg)
  console.log(`Created ${filename}`)
})

// Create shortcut icons
const shortcuts = ['add', 'stats']
shortcuts.forEach(name => {
  const filename = path.join(iconsDir, `${name}.svg`)
  fs.writeFileSync(filename, svgIcon.replace('🎙️', name === 'add' ? '➕' : '📋'))
  console.log(`Created ${filename}`)
})

console.log('\nNote: These are SVG placeholders. For production, convert to PNG with proper tools.')
console.log('You can use tools like sharp or canvas to generate actual PNG files.')