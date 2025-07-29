import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import nodemailer from 'nodemailer'

const CONTACT_TYPES = {
  general: '일반 문의',
  bug: '버그 신고',
  feature: '기능 제안',
  other: '기타 문의',
} as const

export async function POST(request: NextRequest) {
  try {
    const { type, email, subject, message } = await request.json()

    // 유효성 검증
    if (!type || !email || !subject || !message) {
      return NextResponse.json(
        { error: '모든 필드를 입력해주세요' },
        { status: 400 },
      )
    }

    // 이메일 유효성 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '유효한 이메일 주소를 입력해주세요' },
        { status: 400 },
      )
    }

    // 사용자 정보 가져오기
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // 이메일 HTML 내용 구성
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(to right, #6366f1, #ec4899); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .info-item { margin: 10px 0; }
        .label { font-weight: bold; color: #4b5563; }
        .message-box { background: white; padding: 20px; border-radius: 8px; white-space: pre-wrap; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">울림 문의</h1>
        </div>
        <div class="content">
            <div class="info-box">
                <h2 style="color: #1f2937; margin-top: 0;">문의 정보</h2>
                <div class="info-item">
                    <span class="label">문의 유형:</span> ${CONTACT_TYPES[type as keyof typeof CONTACT_TYPES]}
                </div>
                <div class="info-item">
                    <span class="label">발신자:</span> ${email}
                </div>
                <div class="info-item">
                    <span class="label">사용자 ID:</span> ${user?.id || '비로그인'}
                </div>
                <div class="info-item">
                    <span class="label">제목:</span> ${subject}
                </div>
            </div>
            
            <h2 style="color: #1f2937;">문의 내용</h2>
            <div class="message-box">
                ${message.replace(/\n/g, '<br>')}
            </div>
        </div>
        <div class="footer">
            <p>이 이메일은 울림 문의 시스템에서 자동으로 발송되었습니다.</p>
        </div>
    </div>
</body>
</html>
    `.trim()

    try {
      // 환경 변수 확인
      console.log('SMTP Config:', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        passExists: !!process.env.SMTP_PASS,
        to: process.env.EMAIL_TO,
      })

      // Gmail SMTP 설정
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      })

      // 연결 테스트
      await transporter.verify()
      console.log('SMTP connection verified')

      // 이메일 전송
      const info = await transporter.sendMail({
        from: `"울림" <${process.env.SMTP_USER}>`,
        to: process.env.EMAIL_TO || 'ullim0125@gmail.com',
        replyTo: email,
        subject: `[울림 문의] ${subject}`,
        html: emailHtml,
      })

      console.log('Email sent successfully:', info.messageId)
      console.log('Email response:', info)
    } catch (emailError) {
      console.error('Failed to send email:', emailError)
      // 실제 에러를 클라이언트에 전달
      return NextResponse.json(
        {
          error: '이메일 전송에 실패했습니다',
          details:
            emailError instanceof Error ? emailError.message : 'Unknown error',
        },
        { status: 500 },
      )
    }

    // Supabase에 문의 내역 저장 (선택사항)
    if (user) {
      const { error: dbError } = await supabase.from('contacts').insert({
        user_id: user.id,
        type,
        email,
        subject,
        message,
        status: 'pending',
      })

      if (dbError) {
        console.error('Failed to save contact to database:', dbError)
        // DB 저장 실패해도 이메일은 전송되었으므로 성공 응답
      }
    }

    return NextResponse.json({
      success: true,
      message: '문의가 성공적으로 전송되었습니다',
    })
  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json(
      { error: '문의 전송 중 오류가 발생했습니다' },
      { status: 500 },
    )
  }
}
