"use client";
import React from 'react';

const MotivationalVideo = ({ 
    title = "Join Our Mission", 
    description = "Watch how you can make an impact and earn with Swastik Medicare.",
    videoUrl = "https://www.youtube.com/embed/ScMzIvxBSi4", // Responsive generic delivery placeholder
    ctaText = "Join Now",
    ctaLink = "#"
}) => {
    return (
        <div style={{
            margin: '40px 0',
            padding: '40px',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            borderRadius: '24px',
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Background Accent */}
            <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '200px',
                height: '200px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                zIndex: 0
            }}></div>

            <div style={{ position: 'relative', zIndex: 1 }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '10px' }}>{title}</h2>
                <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '30px', maxWidth: '700px', margin: '0 auto 30px' }}>
                    {description}
                </p>

                <div style={{
                    width: '100%',
                    maxWidth: '800px',
                    margin: '0 auto',
                    aspectRatio: '16/9',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    border: '4px solid rgba(255,255,255,0.2)'
                }}>
                    <iframe 
                        width="100%" 
                        height="100%" 
                        src={videoUrl} 
                        title="Swastik Medicare Introduction" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        allowFullScreen
                    ></iframe>
                </div>

                {ctaLink !== "#" && (
                    <div style={{ marginTop: '30px' }}>
                        <a 
                            href={ctaLink} 
                            style={{
                                background: 'white',
                                color: '#1e3a8a',
                                padding: '15px 40px',
                                borderRadius: '30px',
                                fontWeight: 'bold',
                                textDecoration: 'none',
                                fontSize: '1.1rem',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                            }}
                        >
                            {ctaText}
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MotivationalVideo;
