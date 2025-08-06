'use client'

import { useEffect } from 'react'

export function ScrollbarHider() {
  useEffect(() => {
    // 스크롤바 숨김을 위한 동적 스타일 삽입
    const style = document.createElement('style')
    style.textContent = `
      /* 동적으로 스크롤바 제거 */
      html, body {
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }
      
      html::-webkit-scrollbar,
      body::-webkit-scrollbar {
        width: 0px !important;
        height: 0px !important;
        display: none !important;
      }
      
      /* 모든 요소의 스크롤바 제거 */
      *::-webkit-scrollbar {
        width: 0px !important;
        height: 0px !important;
        display: none !important;
      }
      
      * {
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }
    `
    document.head.appendChild(style)
    
    // viewport meta 태그 업데이트
    const viewportMeta = document.querySelector('meta[name="viewport"]')
    if (viewportMeta) {
      viewportMeta.setAttribute('content', 
        'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
      )
    }
    
    return () => {
      style.remove()
    }
  }, [])
  
  return null
}