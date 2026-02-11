"use client";
import React, { useState, useEffect } from 'react';

export default function AdBanner({ position }) {
    const [ads, setAds] = useState([]);

    useEffect(() => {
        fetch(`/api/ads?position=${position}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.ads.length > 0) {
                    setAds(data.ads);
                }
            })
            .catch(err => console.error("Ad fetch error", err));
    }, [position]);

    if (ads.length === 0) return null;

    // Simple carousel or random ad
    const activeAd = ads[0];

    return (
        <div style={{ width: '100%', margin: '20px 0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <a href={activeAd.targetUrl || '#'}>
                <div style={{ position: 'relative', width: '100%', height: '200px', background: '#f3f4f6' }}>
                    <img
                        src={activeAd.imageUrl}
                        alt={activeAd.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/1200x300?text=Advertise+Here';
                        }}
                    />
                    <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>
                        Sponsored
                    </div>
                </div>
            </a>
        </div>
    );
}
