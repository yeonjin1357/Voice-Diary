import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface DateFormatterProps {
  date: Date | string
  format?: string
  className?: string
}

export function DateFormatter({ 
  date, 
  format: dateFormat = 'PPP EEE', 
  className 
}: DateFormatterProps) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return (
    <time 
      dateTime={dateObj.toISOString()} 
      className={className}
    >
      {format(dateObj, dateFormat, { locale: ko })}
    </time>
  )
}