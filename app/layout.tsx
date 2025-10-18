import { Metadata } from 'next';
import "../styles/globals.css";
import {Providers} from './providers';

export const metadata: Metadata = {
  title: 'Trello-like Board'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className='light'>
      <body className='bg-primary text-secondary min-h-screen'>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
