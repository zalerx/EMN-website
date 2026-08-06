import { Schibsted_Grotesk } from 'next/font/google'
import Candu  from 'next/font/local'

// Both fonts expose CSS variables so Tailwind's fontFamily tokens
// (`font-candu`, default `font-sans`) resolve to the hashed families
// next/font generates. Swapping Candu for another face is a one-line
// change to `src` here — nothing else references the file.
export const schibstedGrotesk = Schibsted_Grotesk({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-schibsted',
    });

export const candu = Candu({
    src: '../../public/fonts/Candu.woff2',
    display: 'swap',
    variable: '--font-candu',
    });
