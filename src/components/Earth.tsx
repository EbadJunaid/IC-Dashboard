"use client"

import { useState, useEffect, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type { ThreeEvent } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import * as THREE from "three"
import type { DataCenter } from "@/types"

// Define types
interface ContinentFeature {
  type: string;
  properties: { continent: string };
  geometry: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
}

// Data Center Point Component
function DataCenterPoint({
  position,
  dataCenter,
  onHover,
  onLeave,
  onMobileClick,
  isMobile,
  isTablet,
  isHovered,
}: {
  position: [number, number, number]
  dataCenter: DataCenter
  onHover: () => void
  onLeave: () => void
  onMobileClick: (dataCenter: DataCenter) => void
  isMobile: boolean
  isTablet: boolean
  isHovered: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (meshRef.current) {
      const targetScale = isHovered ? 1.5 : 1
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    }
  })

  const handlePointerEnter = () => {
    if (!isMobile && !isTablet) {
      onHover()
    }
  }

  const handlePointerLeave = () => {
    if (!isMobile && !isTablet) {
      onLeave()
    }
  }

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (isMobile || isTablet) {
      onMobileClick(dataCenter)
    }
  }

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (isMobile || isTablet) {
      onMobileClick(dataCenter)
    }
  }

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
    >
      <sphereGeometry args={[isMobile ? 0.03 : isTablet ? 0.025 : 0.02, 8, 8]} />
      <meshBasicMaterial color={isHovered ? "#60a5fa" : "#3b82f6"} />
      {isHovered && !isMobile && !isTablet && (
        <Html
          distanceFactor={8}
          style={{
            transform: "translate3d(-50%, -120%, 0)",
            pointerEvents: "none",
            zIndex: 1000,
          }}
        >
          <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-600 rounded-md p-2 text-white text-xs shadow-2xl min-w-32 max-w-40">
            <h3 className="font-semibold text-blue-400 mb-1 text-xs truncate">
              {dataCenter.name && dataCenter.name.length > 15 ? `${dataCenter.name.substring(0, 15)}...` : dataCenter.name || 'Unknown'}
            </h3>
            <div className="space-y-0.5 text-xs">
              <p className="truncate">
                <span className="text-gray-400">Owner:</span>{" "}
                {dataCenter.owner && dataCenter.owner.length > 8 ? `${dataCenter.owner.substring(0, 8)}...` : dataCenter.owner || 'N/A'}
              </p>
              <div className="flex justify-between text-xs">
                <span>N: {dataCenter.total_nodes || 0}</span>
                <span>P: {dataCenter.node_providers || 0}</span>
              </div>
            </div>
          </div>
        </Html>
      )}
    </mesh>
  )
}

interface EarthProps {
  isMobile: boolean
  isTablet: boolean
  onMobileDataCenterClick: (dc: DataCenter) => void
}

export function Earth({ isMobile, isTablet, onMobileDataCenterClick }: EarthProps) {
  const earthRef = useRef<THREE.Group>(null)
  const [dataCenters, setDataCenters] = useState<DataCenter[]>([])
  const [continentBoundaries, setContinentBoundaries] = useState<ContinentFeature[]>([])
  const [hoveredDataCenter, setHoveredDataCenter] = useState<string | null>(null)

  // Load data centers
  useEffect(() => {
    fetch("https://ic-api.internetcomputer.org/api/v3/data-centers")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data centers")
        return res.json()
      })
      .then((data) => {
        if (data.data_centers) {
          setDataCenters(Object.values(data.data_centers))
        }
      })
      .catch((err) => console.error("Failed to load data centers:", err))
  }, [])

  // Load continent boundaries
  useEffect(() => {
    fetch("/continents.geojson")
      .then((res) => {
        if (!res.ok) {
          console.warn("Failed to fetch continent boundaries - file not found")
          return null
        }
        return res.json()
      })
      .then((data) => {
        if (data && data.features) {
          setContinentBoundaries(data.features)
        }
      })
      .catch((err) => console.error("Failed to load continent boundaries:", err))
  }, [])

  // Convert lat/lng to 3D coordinates
  const latLngToVector3 = (lat: number, lng: number, radius: number = 2.5): [number, number, number] => {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lng + 180) * (Math.PI / 180)

    const x = -(radius * Math.sin(phi) * Math.cos(theta))
    const z = radius * Math.sin(phi) * Math.sin(theta)
    const y = radius * Math.cos(phi)

    return [x, y, z]
  }

  // Create continent boundary lines
  const createBoundaryLines = (): React.ReactElement[] => {
    const lines: React.ReactElement[] = []
    const earthRadius = isMobile ? 2.7 : isTablet ? 2.6 : 2.5

    continentBoundaries.forEach((feature, index) => {
      try {
        if (feature.geometry.type === "Polygon") {
          // Use the first ring (outer boundary)
          const ring = feature.geometry.coordinates[0]
          if (Array.isArray(ring)) {
            const points = ring.map((coord) => {
              if (Array.isArray(coord) && coord.length >= 2) {
                const lng = typeof coord[0] === 'number' ? coord[0] : 0
                const lat = typeof coord[1] === 'number' ? coord[1] : 0
                const [x, y, z] = latLngToVector3(lat, lng, earthRadius + 0.01)
                return new THREE.Vector3(x, y, z)
              }
              return new THREE.Vector3(0, 0, 0)
            })
            const positions = new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))
            lines.push(
              <line key={`${index}-outer`}>
                <bufferGeometry>
                  <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                </bufferGeometry>
                <lineBasicMaterial color="#ca31fe" transparent opacity={0.6} />
              </line>,
            )
          }
        } else if (feature.geometry.type === "MultiPolygon") {
          // Use the first ring of each polygon (outer boundary)
          feature.geometry.coordinates.forEach((polygon, polyIndex) => {
            if (Array.isArray(polygon) && polygon.length > 0) {
              const ring = polygon[0]
              if (Array.isArray(ring)) {
                const points = ring.map((coord) => {
                  if (Array.isArray(coord) && coord.length >= 2) {
                    const lng = typeof coord[0] === 'number' ? coord[0] : 0
                    const lat = typeof coord[1] === 'number' ? coord[1] : 0
                    const [x, y, z] = latLngToVector3(lat, lng, earthRadius + 0.01)
                    return new THREE.Vector3(x, y, z)
                  }
                  return new THREE.Vector3(0, 0, 0)
                })
                const positions = new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))
                lines.push(
                  <line key={`${index}-${polyIndex}-outer`}>
                    <bufferGeometry>
                      <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                    </bufferGeometry>
                    <lineBasicMaterial color="#ca31fe" transparent opacity={0.8} />
                  </line>,
                )
              }
            }
          })
        }
      } catch (error) {
        console.warn(`Error processing continent feature ${index}:`, error)
      }
    })

    return lines
  }

  // Helper to create grid lines (latitude and longitude)
  const createGridLines = (): React.ReactElement[] => {
    const lines: React.ReactElement[] = []
    const earthRadius = isMobile ? 2.7 : isTablet ? 2.6 : 2.5
    const latStep = 20 // degrees between latitude lines
    const lngStep = 20 // degrees between longitude lines

    // Latitude lines (horizontal rings)
    for (let lat = -80; lat <= 80; lat += latStep) {
      const points: THREE.Vector3[] = []
      for (let lng = -180; lng <= 180; lng += 3) {
        const [x, y, z] = latLngToVector3(lat, lng, earthRadius + 0.005)
        points.push(new THREE.Vector3(x, y, z))
      }
      const positions = new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))
      lines.push(
        <line key={`lat-${lat}`}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#64748b" transparent opacity={0.15} />
        </line>
      )
    }

    // Longitude lines (vertical rings)
    for (let lng = -180; lng < 180; lng += lngStep) {
      const points: THREE.Vector3[] = []
      for (let lat = -90; lat <= 90; lat += 3) {
        const [x, y, z] = latLngToVector3(lat, lng, earthRadius + 0.005)
        points.push(new THREE.Vector3(x, y, z))
      }
      const positions = new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))
      lines.push(
        <line key={`lng-${lng}`}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#64748b" transparent opacity={0.15} />
        </line>
      )
    }

    return lines
  }

  // Simple rotation
  useFrame((state, delta) => {
    if (earthRef.current && !hoveredDataCenter) {
      earthRef.current.rotation.y += delta * 0.1
    }
  })

  // Responsive Earth size
  const earthRadius = isMobile ? 2.7 : isTablet ? 2.6 : 2.5

  return (
    <group ref={earthRef}>
      {/* Earth Sphere - Responsive size */}
      <mesh>
        <sphereGeometry args={[earthRadius, 64, 64]} />
        <meshBasicMaterial color="#240086" transparent opacity={0.4} />
      </mesh>

      {/* Grid Lines - Now properly visible */}
      {createGridLines()}

      {/* Continent Boundaries */}
      {createBoundaryLines()}

      {/* Data Center Points */}
      {dataCenters.map((dc) => (
        <DataCenterPoint
          key={dc.key}
          position={latLngToVector3(dc.latitude || 0, dc.longitude || 0, earthRadius + 0.02)}
          dataCenter={dc}
          onHover={() => setHoveredDataCenter(dc.key)}
          onLeave={() => setHoveredDataCenter(null)}
          onMobileClick={onMobileDataCenterClick}
          isMobile={isMobile}
          isTablet={isTablet}
          isHovered={hoveredDataCenter === dc.key}
        />
      ))}
    </group>
  )
}