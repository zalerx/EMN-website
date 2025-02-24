import { Schibsted_Grotesk } from 'next/font/google'
import Candu  from 'next/font/local'

export const schibstedGrotesk = Schibsted_Grotesk({
    subsets: ['latin'],
    display: 'swap', 
    });

export const candu = Candu({
    src: '../../public/fonts/Candu.woff2',
    display: 'swap',
    });