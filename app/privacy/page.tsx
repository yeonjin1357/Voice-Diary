'use client'

import { MobileLayout } from '@/components/layout/mobile-layout'

export default function PrivacyPage() {
  const header = (
    <div className="px-4 py-3">
      <h1 className="text-lg font-semibold">개인정보처리방침</h1>
    </div>
  )

  return (
    <MobileLayout header={header}>
      <div className="px-4 py-6">
        <div className="prose prose-sm max-w-none">
          <p className="text-sm text-gray-600">최종 수정일: 2025년 7월 28일</p>

          <h2 className="mt-6 text-lg font-semibold">
            1. 개인정보의 수집 및 이용 목적
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            울림(이하 &apos;서비스&apos;)는 다음과 같은 목적으로 개인정보를
            수집하고 이용합니다:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
            <li>회원 가입 및 관리</li>
            <li>음성 일기 작성 및 저장</li>
            <li>AI 기반 감정 분석 서비스 제공</li>
            <li>서비스 개선 및 통계 분석</li>
          </ul>

          <h2 className="mt-6 text-lg font-semibold">
            2. 수집하는 개인정보 항목
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
            <li>이메일 주소 (회원가입 시)</li>
            <li>음성 녹음 데이터 (일시적 보관, 텍스트 변환 후 즉시 삭제)</li>
            <li>일기 내용 (텍스트)</li>
            <li>감정 분석 결과 데이터</li>
          </ul>

          <h2 className="mt-6 text-lg font-semibold">
            3. 개인정보의 보유 및 이용 기간
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
            <li>회원 정보: 회원 탈퇴 시까지</li>
            <li>음성 녹음: 텍스트 변환 완료 후 즉시 삭제</li>
            <li>일기 데이터: 사용자가 삭제하기 전까지 보관</li>
          </ul>

          <h2 className="mt-6 text-lg font-semibold">
            4. 개인정보의 제3자 제공
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            서비스는 원칙적으로 사용자의 개인정보를 제3자에게 제공하지 않습니다.
            다만, 다음의 경우는 예외로 합니다:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
            <li>사용자의 명시적인 동의가 있는 경우</li>
            <li>법령의 규정에 의한 경우</li>
          </ul>

          <h2 className="mt-6 text-lg font-semibold">
            5. 개인정보의 처리 위탁
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            서비스는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리를
            위탁합니다:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
            <li>
              OpenAI: 음성-텍스트 변환 및 감정 분석 (음성 데이터는 변환 후 즉시
              삭제)
            </li>
            <li>Supabase: 데이터베이스 호스팅 및 인증 서비스</li>
          </ul>

          <h2 className="mt-6 text-lg font-semibold">6. 이용자의 권리</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            사용자는 언제든지 다음의 권리를 행사할 수 있습니다:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
            <li>개인정보 열람 요구</li>
            <li>개인정보 정정·삭제 요구</li>
            <li>개인정보 처리 정지 요구</li>
            <li>회원 탈퇴</li>
          </ul>

          <h2 className="mt-6 text-lg font-semibold">
            7. 개인정보의 안전성 확보 조치
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
            <li>SSL 암호화 통신</li>
            <li>비밀번호 암호화 저장</li>
            <li>정기적인 보안 업데이트</li>
          </ul>

          <h2 className="mt-6 text-lg font-semibold">8. 개인정보 보호책임자</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            개인정보 관련 문의사항은 아래로 연락주시기 바랍니다:
          </p>
          <p className="mt-2 text-sm text-gray-700">
            이메일: ullim0125@gmail.com
          </p>

          <h2 className="mt-6 text-lg font-semibold">
            9. 개인정보처리방침의 변경
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            이 개인정보처리방침은 관련 법령 및 서비스 정책에 따라 변경될 수
            있으며, 변경 시 서비스 내 공지사항을 통해 안내드립니다.
          </p>
        </div>
      </div>
    </MobileLayout>
  )
}
