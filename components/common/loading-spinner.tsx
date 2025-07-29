export function LoadingSpinner({ message }: { message?: string }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      {message && (
        <p className="text-center text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  )
}