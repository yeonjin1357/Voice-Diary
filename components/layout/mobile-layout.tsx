import { BottomNavigation } from '@/components/ui/bottom-navigation'

interface MobileLayoutProps {
  children: React.ReactNode
  header?: React.ReactNode
  className?: string
}

export function MobileLayout({ children, header, className }: MobileLayoutProps) {
  return (
    <div className={`min-h-screen bg-neutral-50 dark:bg-neutral-950 ${className || ''}`}>
      {header && (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm dark:bg-neutral-900/80 border-b border-neutral-200 dark:border-neutral-800">
          {header}
        </header>
      )}
      
      <main className="pb-16">
        {children}
      </main>
      
      <BottomNavigation />
    </div>
  )
}