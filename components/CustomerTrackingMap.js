"use client";
import { useEffect, useRef } from "react";

export default function CustomerTrackingMap({
    riderLat, riderLng, riderHeading,
    customerLat, customerLng,
    retailerLat, retailerLng
}) {
    const mapRef = useRef(null);
    const leafletMapRef = useRef(null);
    const riderMarkerRef = useRef(null);

    useEffect(() => {
        if (typeof window === "undefined" || leafletMapRef.current) return;

        // Inject Leaflet CSS
        if (!document.getElementById("leaflet-css")) {
            const link = document.createElement("link");
            link.id = "leaflet-css";
            link.rel = "stylesheet";
            link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
            document.head.appendChild(link);
        }

        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => initMap();
        document.head.appendChild(script);

        return () => {
            if (leafletMapRef.current) {
                leafletMapRef.current.remove();
                leafletMapRef.current = null;
            }
        };
    }, []);

    const initMap = () => {
        if (!mapRef.current || leafletMapRef.current) return;
        const L = window.L;

        const centerLat = riderLat || customerLat || 26.7606;
        const centerLng = riderLng || customerLng || 83.3732;

        const map = L.map(mapRef.current, {
            center: [centerLat, centerLng],
            zoom: 15,
            zoomControl: false,
            attributionControl: false
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19
        }).addTo(map);

        leafletMapRef.current = map;

        // Customer destination marker (house)
        if (customerLat && customerLng) {
            L.marker([customerLat, customerLng], {
                icon: L.divIcon({
                    className: "",
                    html: `<div style="font-size: 26px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">🏠</div>`,
                    iconSize: [30, 30],
                    iconAnchor: [15, 30]
                })
            }).addTo(map).bindPopup("Delivery Address");
        }

        // Retailer/origin marker (pharmacy)
        if (retailerLat && retailerLng) {
            L.marker([retailerLat, retailerLng], {
                icon: L.divIcon({
                    className: "",
                    html: `<div style="font-size: 26px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">🏪</div>`,
                    iconSize: [30, 30],
                    iconAnchor: [15, 30]
                })
            }).addTo(map).bindPopup("Dispatched from Pharmacy");

            // Draw route line if both retailer and customer are available
            if (customerLat && customerLng) {
                L.polyline([[retailerLat, retailerLng], [customerLat, customerLng]], {
                    color: '#10B981', // green-500
                    weight: 4,
                    opacity: 0.5,
                    dashArray: '8, 8'
                }).addTo(map);
            }
        }

        // Rider marker
        if (riderLat && riderLng) {
            const riderIcon = L.divIcon({
                className: "",
                html: `
                    <div style="
                        width: 44px; height: 44px;
                        background: #10B981;
                        border-radius: 50%;
                        border: 3px solid white;
                        box-shadow: 0 4px 12px rgba(16,185,129,0.5);
                        display: flex; align-items: center; justify-content: center;
                        font-size: 22px;
                        transition: all 0.3s ease;
                    ">
                        🏍️
                    </div>
                `,
                iconSize: [44, 44],
                iconAnchor: [22, 22] // center it
            });

            riderMarkerRef.current = L.marker([riderLat, riderLng], { icon: riderIcon, zIndexOffset: 1000 })
                .addTo(map)
                .bindPopup("Your Delivery Rider");
        }
    };

    // Smoothly update rider position when it changes
    useEffect(() => {
        if (!leafletMapRef.current || !riderMarkerRef.current || !riderLat || !riderLng) return;
        const L = window.L;

        riderMarkerRef.current.setLatLng([riderLat, riderLng]);
        
        // Pan map to keep rider in view
        leafletMapRef.current.panTo([riderLat, riderLng], { animate: true, duration: 1.5 });
    }, [riderLat, riderLng]);

    return (
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
    );
}
