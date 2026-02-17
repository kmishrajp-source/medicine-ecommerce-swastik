import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Swastik Medicare',
        short_name: 'Swastik',
        description: 'Premium Online Pharmacy & Healthcare Service',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0D8ABC', // Teal-Blue
        icons: [
            {
                src: '/icon.png',
                sizes: 'any',
                type: 'image/png',
            },
        ],
    }
}
