"use client";
import { useEffect, useRef } from "react";

const alertTypeColor = { DELAY: "#F59E0B", DEVIATION: "#8B5CF6", OFFLINE: "#EF4444", SOS: "#DC2626" };

export default function DeliveryMonitorMap({ agents, alerts, selectedAgent, onSelectAgent }) {
    const mapRef = useRef(null);
    const leafletMapRef = useRef(null);
    const markersRef = useRef({});
    const alertCirclesRef = useRef([]);

    useEffect(() => {
        if (typeof window === "undefined" || leafletMapRef.current) return;

        // Load Leaflet CSS
        if (!document.getElementById("leaflet-css")) {
            const link = document.createElement("link");
            link.id = "leaflet-css";
            link.rel = "stylesheet";
            link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
            document.head.appendChild(link);
        }

        // Load Leaflet JS
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

        const map = L.map(mapRef.current, {
            center: [26.7606, 83.3732], // Gorakhpur
            zoom: 13,
            zoomControl: true
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);

        leafletMapRef.current = map;
        updateMarkers(map, L);
    };

    const updateMarkers = (map, L) => {
        if (!map || !L) return;

        // Clear old alert circles
        alertCirclesRef.current.forEach(c => c.remove());
        alertCirclesRef.current = [];

        // Update rider markers
        const currentIds = new Set();

        agents.forEach(agent => {
            if (!agent.lat || !agent.lng) return;
            currentIds.add(agent.id);

            const isLive = agent.isLive;
            const hasAlert = agent.hasActiveAlerts;

            // Create icon
            const emoji = isLive ? "🟢" : "⚫";
            const icon = L.divIcon({
                className: "",
                html: `
                    <div style="
                        position: relative;
                        transform: rotate(${agent.heading || 0}deg);
                        width: 36px; height: 36px;
                        background: ${hasAlert ? "#EF4444" : isLive ? "#10B981" : "#6B7280"};
                        border-radius: 50% 50% 50% 0;
                        transform: rotate(-45deg);
                        border: 2px solid white;
                        box-shadow: 0 3px 12px rgba(0,0,0,0.3);
                        display: flex; align-items: center; justify-content: center;
                    ">
                        <span style="transform: rotate(45deg); font-size: 14px;">🏍️</span>
                    </div>
                `,
                iconSize: [36, 36],
                iconAnchor: [18, 36],
                popupAnchor: [0, -36]
            });

            const popupContent = `
                <div style="font-family: Inter, sans-serif; padding: 4px;">
                    <strong>${agent.name}</strong><br/>
                    <small>${agent.vehicleNumber} · ${agent.phone}</small><br/>
                    ${isLive ? `<span style="color: green;">● LIVE</span>` : `<span style="color: gray;">● Offline</span>`}
                    ${agent.speed ? `<br/>Speed: ${agent.speed} km/h` : ""}
                    ${agent.etaMinutes ? `<br/>ETA: ${agent.etaMinutes} min` : ""}
                    ${agent.activeOrder ? `<br/>Order: #${agent.activeOrder.id.slice(-6).toUpperCase()}` : ""}
                    ${hasAlert ? `<br/><span style="color: red;">🚨 ${agent.alertCount} active alert(s)</span>` : ""}
                </div>
            `;

            if (markersRef.current[agent.id]) {
                markersRef.current[agent.id].setLatLng([agent.lat, agent.lng]);
                markersRef.current[agent.id].setIcon(icon);
                markersRef.current[agent.id].getPopup()?.setContent(popupContent);
            } else {
                const marker = L.marker([agent.lat, agent.lng], { icon })
                    .addTo(map)
                    .bindPopup(popupContent)
                    .on("click", () => onSelectAgent?.(agent));
                markersRef.current[agent.id] = marker;
            }

            // Draw alert pulse circle if alert present
            if (hasAlert) {
                const circle = L.circle([agent.lat, agent.lng], {
                    radius: 200,
                    color: "#EF4444",
                    fillColor: "#EF4444",
                    fillOpacity: 0.1,
                    weight: 2
                }).addTo(map);
                alertCirclesRef.current.push(circle);
            }
        });

        // Remove stale markers
        Object.keys(markersRef.current).forEach(id => {
            if (!currentIds.has(id)) {
                markersRef.current[id].remove();
                delete markersRef.current[id];
            }
        });
    };

    // Update markers when agents data changes
    useEffect(() => {
        if (!leafletMapRef.current || !window.L) return;
        updateMarkers(leafletMapRef.current, window.L);
    }, [agents, alerts]);

    // Pan to selected agent
    useEffect(() => {
        if (!leafletMapRef.current || !selectedAgent?.lat) return;
        leafletMapRef.current.setView([selectedAgent.lat, selectedAgent.lng], 15);
        markersRef.current[selectedAgent.id]?.openPopup();
    }, [selectedAgent]);

    return (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <div ref={mapRef} style={{ width: "100%", height: "100%", minHeight: "600px" }} />

            {/* Legend */}
            <div style={{
                position: "absolute", top: "16px", right: "16px", zIndex: 1000,
                background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px", padding: "12px 16px", color: "white", fontSize: "0.75rem"
            }}>
                <div style={{ fontWeight: 900, marginBottom: "8px", fontSize: "0.8rem" }}>📡 Live Map Legend</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div>🟢 Live GPS Active</div>
                    <div>⚫ Rider Offline</div>
                    <div>🔴 Alert Triggered</div>
                    <div>🏍️ Rider Marker</div>
                </div>
            </div>
        </div>
    );
}
