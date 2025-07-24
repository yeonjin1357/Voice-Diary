export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div className="mb-8 text-6xl">📵</div>
      <h1 className="mb-4 text-3xl font-bold">오프라인 상태입니다</h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        인터넷 연결이 없습니다. 연결이 복구되면 자동으로 동기화됩니다.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="rounded-lg bg-primary px-6 py-3 text-primary-foreground transition-colors hover:bg-primary/90"
      >
        다시 시도
      </button>
    </div>
  )
}