'use client'

import { useEffect } from 'react'

export function ScrollbarHider() {
  useEffect(() => {
    // 스크롤바 숨김을 위한 동적 스타일 삽입
    const style = document.createElement('style')
    style.textContent = `
      /* 동적으로 스크롤바 제거 */
      html, body, *, *::before, *::after {
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }
      
      html::-webkit-scrollbar,
      body::-webkit-scrollbar,
      *::-webkit-scrollbar {
        width: 0px !important;
        height: 0px !important;
        display: none !important;
      }
      
      /* 특정 클래스에 대한 스크롤바 제거 */
      .no-scrollbar::-webkit-scrollbar {
        display: none !important;
      }
      
      .no-scrollbar {
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }
    `
    document.head.appendChild(style)
    
    // body와 html에 클래스 추가
    document.documentElement.classList.add('no-scrollbar')
    document.body.classList.add('no-scrollbar')
    
    // 모든 스크롤 가능한 요소에 no-scrollbar 클래스 추가
    const addNoScrollbar = () => {
      const scrollableElements = document.querySelectorAll('*')
      scrollableElements.forEach(el => {
        const styles = window.getComputedStyle(el)
        if (
          styles.overflow === 'auto' || 
          styles.overflow === 'scroll' ||
          styles.overflowY === 'auto' || 
          styles.overflowY === 'scroll' ||
          styles.overflowX === 'auto' || 
          styles.overflowX === 'scroll'
        ) {
          el.classList.add('no-scrollbar')
        }
      })
    }
    
    // 초기 실행
    addNoScrollbar()
    
    // DOM 변경 감지
    const observer = new MutationObserver(addNoScrollbar)
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    })
    
    // viewport meta 태그 업데이트
    const viewportMeta = document.querySelector('meta[name="viewport"]')
    if (viewportMeta) {
      viewportMeta.setAttribute('content', 
        'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
      )
    }
    
    return () => {
      style.remove()
      observer.disconnect()
    }
  }, [])
  
  return null
}