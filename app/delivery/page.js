'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'

// Dynamically import Map components because Leaflet only works on the client-side
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

export default function DeliveryTrackingMap() {
    const [agents, setAgents] = useState([])
    const defaultCenter = [22.5726, 88.3639] // Example: Kolkata Coordinates

    useEffect(() => {
        // 1. Fetch initial online drivers
        fetchOnlineAgents()

        // 2. Subscribe to Real-time GPS updates from Supabase
        const subscription = supabase
            .channel('public:delivery_agents')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'delivery_agents'
            }, (payload) => {
                console.log('Real-time GPS Update Received:', payload.new)
                setAgents((prev) =>
                    prev.map(agent => agent.id === payload.new.id ? payload.new : agent)
                )
            })
            .subscribe()

        return () => {
            supabase.removeChannel(subscription)
        }
    }, [])

    async function fetchOnlineAgents() {
        const { data, error } = await supabase
            .from('delivery_agents')
            .select('*')
            .eq('is_online', true)

        if (data) setAgents(data)
    }

    // Helper to extract Lat/Lng from PostGIS Point string
    const parsePostGisPoint = (pointString) => {
        if (!pointString) return null
        // Example string format: "POINT(88.3639 22.5726)"
        const match = pointString.match(/POINT\(([^ ]+) ([^ ]+)\)/)
        if (match) {
            // Leaflet expects [Lat, Lng]
            return [parseFloat(match[2]), parseFloat(match[1])]
        }
        return null
    }

    return (
        <main className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-teal-400">
                    Live Delivery Tracking
                </h1>
                <p className="text-gray-600 mt-2">
                    Tracking {agents.length} active delivery partners in real-time.
                </p>
            </div>

            <div className="h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
                <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />

                    {agents.map((agent) => {
                        const position = parsePostGisPoint(agent.current_location)
                        if (!position) return null

                        return (
                            <Marker key={agent.id} position={position}>
                                <Popup>
                                    <div className="font-semibold text-lg">{agent.full_name}</div>
                                    <div className="text-sm text-gray-500">{agent.vehicle_number}</div>
                                    <div className="mt-2 text-xs text-green-600 font-bold tracking-wider">
                                        ● ONLINE NOW
                                    </div>
                                </Popup>
                            </Marker>
                        )
                    })}
                </MapContainer>
            </div>
        </main>
    )
}
