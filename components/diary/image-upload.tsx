'use client'

import { useState, useRef } from 'react'
import { X, Plus } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  disabled?: boolean
}

export function ImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const remainingSlots = maxImages - images.length
    const filesToUpload = Array.from(files).slice(0, remainingSlots)

    if (filesToUpload.length === 0) {
      alert(`최대 ${maxImages}개의 이미지만 업로드할 수 있습니다.`)
      return
    }

    setIsUploading(true)
    const uploadedUrls: string[] = []

    try {
      for (const file of filesToUpload) {
        // 파일 크기 체크 (최대 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('이미지 크기는 5MB 이하여야 합니다.')
          continue
        }

        // 파일 타입 체크
        if (!file.type.startsWith('image/')) {
          alert('이미지 파일만 업로드할 수 있습니다.')
          continue
        }

        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/diary/upload-image', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('이미지 업로드에 실패했습니다.')
        }

        const { url } = await response.json()
        uploadedUrls.push(url)
      }

      onImagesChange([...images, ...uploadedUrls])
    } catch (error) {
      alert('이미지 업로드 중 오류가 발생했습니다.')
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* 이미지 미리보기 그리드 */}
      <div className="grid grid-cols-3 gap-2">
        {images.map((imageUrl, index) => (
          <div
            key={imageUrl}
            className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100"
          >
            <Image
              src={imageUrl}
              alt={`업로드된 이미지 ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 33vw"
            />
            <button
              onClick={() => handleRemoveImage(index)}
              className="absolute right-1 top-1 rounded-full bg-black/50 p-1 opacity-0 transition-opacity group-hover:opacity-100"
              disabled={disabled}
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        ))}

        {/* 이미지 추가 버튼 */}
        {images.length < maxImages && (
          <button
            onClick={handleTriggerFileInput}
            disabled={disabled || isUploading}
            className={cn(
              'flex aspect-square flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
              disabled || isUploading
                ? 'border-gray-200 bg-gray-50 text-gray-400'
                : 'border-gray-300 bg-white text-gray-500 hover:border-gray-400 hover:bg-gray-50'
            )}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                <span className="text-xs">업로드 중...</span>
              </div>
            ) : (
              <>
                <Plus className="h-6 w-6" />
                <span className="mt-1 text-xs">사진 추가</span>
                <span className="text-xs text-gray-400">
                  {images.length}/{maxImages}
                </span>
              </>
            )}
          </button>
        )}
      </div>

    </div>
  )
}