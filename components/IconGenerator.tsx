'use client'

import { useEffect } from 'react'

const IconGenerator = () => {
  useEffect(() => {
    const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
    
    sizes.forEach((size) => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      
      if (ctx) {
        // Background
        ctx.fillStyle = '#0a0a0a'
        ctx.fillRect(0, 0, size, size)
        
        // Icon design (simple diet/nutrition icon)
        ctx.fillStyle = '#ffffff'
        ctx.font = `${size * 0.5}px system-ui, -apple-system, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('🥗', size / 2, size / 2)
        
        // Download link
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `icon-${size}x${size}.png`
            a.click()
            URL.revokeObjectURL(url)
          }
        })
      }
    })
  }, [])

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">PWA Icon Generator</h2>
      <p>아이콘이 자동으로 다운로드됩니다. public/icons 폴더로 이동시켜주세요.</p>
    </div>
  )
}

export default IconGenerator