"use client"

import { useState, useEffect, useRef } from "react"
import { useFrame } from "@react-three/fiber"
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
}: {
  position: [number, number, number]
  dataCenter: DataCenter
  onHover: () => void
  onLeave: () => void
  onMobileClick: (dataCenter: DataCenter) => void
  isMobile: boolean
  isTablet: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame(() => {
    if (meshRef.current) {
      const targetScale = hovered ? 1.5 : 1
      meshRef.current.scale.setScalar(targetScale)
    }
  })

  const handlePointerEnter = () => {
    if (!isMobile && !isTablet) {
      setHovered(true)
      onHover()
    }
  }

  const handlePointerLeave = () => {
    if (!isMobile && !isTablet) {
      setHovered(false)
      onLeave()
    }
  }

  const handleClick = (e: any) => {
    e.stopPropagation()
    if (isMobile || isTablet) {
      onMobileClick(dataCenter)
    }
  }

  const handlePointerDown = (e: any) => {
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
      <meshBasicMaterial color={hovered ? "#60a5fa" : "#3b82f6"} />
      {hovered && !isMobile && !isTablet && (
        <Html
          distanceFactor={8}
          style={{
            transform: "translate3d(-50%, -120%, 0)",
            pointerEvents: "none",
            zIndex: 1000,
          }}
        >
          <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-600 rounded-md p-2 text-white text-xs shadow-2xl w-32">
            <h3 className="font-semibold text-blue-400 mb-1 text-xs truncate">
              {dataCenter.name.length > 12 ? `${dataCenter.name.substring(0, 12)}...` : dataCenter.name}
            </h3>
            <div className="space-y-0.5 text-xs">
              <p className="truncate">
                <span className="text-gray-400">Owner:</span>{" "}
                {dataCenter.owner.length > 6 ? `${dataCenter.owner.substring(0, 6)}...` : dataCenter.owner}
              </p>
              <div className="flex justify-between text-xs">
                <span>N: {dataCenter.total_nodes}</span>
                <span>P: {dataCenter.node_providers}</span>
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
  const [isHovered, setIsHovered] = useState(false)

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
        if (!res.ok) throw new Error("Failed to fetch continent boundaries")
        return res.json()
      })
      .then((data) => {
        setContinentBoundaries(data.features)
      })
      .catch((err) => console.error("Failed to load continent boundaries:", err))
  }, [])

  // Convert lat/lng to 3D coordinates
  const latLngToVector3 = (lat: number, lng: number, radius = 2.5) => {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lng + 180) * (Math.PI / 180)

    const x = -(radius * Math.sin(phi) * Math.cos(theta))
    const z = radius * Math.sin(phi) * Math.sin(theta)
    const y = radius * Math.cos(phi)

    return [x, y, z] as [number, number, number]
  }

  // Create continent boundary lines
  const createBoundaryLines = () => {
    const lines: JSX.Element[] = []
    const earthRadius = isMobile ? 2.7 : isTablet ? 2.6 : 2.5

    continentBoundaries.forEach((feature, index) => {
      if (feature.geometry.type === "Polygon") {
        // Use the first ring (outer boundary)
        const ring = feature.geometry.coordinates[0]
        const points = ring.map(([lng, lat]) => {
          const [x, y, z] = latLngToVector3(lat, lng, earthRadius + 0.01)
          return new THREE.Vector3(x, y, z)
        })
        const positions = new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))
        lines.push(
          <line key={`${index}-outer`}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <lineBasicMaterial color="#ca31fe" transparent opacity={0.5} />
          </line>,
        )
      } else if (feature.geometry.type === "MultiPolygon") {
        // Use the first ring of each polygon (outer boundary)
        feature.geometry.coordinates.forEach((polygon, polyIndex) => {
          const ring = polygon[0]
          const points = ring.map(([lng, lat]) => {
            const [x, y, z] = latLngToVector3(lat, lng, earthRadius + 0.01)
            return new THREE.Vector3(x, y, z)
          })
          const positions = new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))
          lines.push(
            <line key={`${index}-${polyIndex}-outer`}>
              <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
              </bufferGeometry>
              <lineBasicMaterial color="#ca31fe" transparent opacity={1} />
            </line>,
          )
        })
      }
    })

    return lines
  }

  // Helper to create grid lines (latitude and longitude)
  const createGridLines = () => {
    const lines: JSX.Element[] = []
    const earthRadius = isMobile ? 2.7 : isTablet ? 2.6 : 2.5
    const latStep = 15 // degrees between latitude lines
    const lngStep = 15 // degrees between longitude lines

    // Latitude lines (horizontal rings)
    for (let lat = -75; lat <= 75; lat += latStep) {
      const points: THREE.Vector3[] = []
      for (let lng = -180; lng <= 180; lng += 5) {
        const [x, y, z] = latLngToVector3(lat, lng, earthRadius + 0.015)
        points.push(new THREE.Vector3(x, y, z))
      }
      const positions = new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))
      lines.push(
        <line key={`lat-${lat}`}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#ffffff" transparent opacity={0.035} />
        </line>
      )
    }

    // Longitude lines (vertical rings)
    for (let lng = -180; lng < 180; lng += lngStep) {
      const points: THREE.Vector3[] = []
      for (let lat = -90; lat <= 90; lat += 5) {
        const [x, y, z] = latLngToVector3(lat, lng, earthRadius + 0.015)
        points.push(new THREE.Vector3(x, y, z))
      }
      const positions = new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))
      lines.push(
        <line key={`lng-${lng}`}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#ffffff" transparent opacity={0.035} />
        </line>
      )
    }

    return lines
  }

  // Simple rotation
  useFrame((state, delta) => {
    if (earthRef.current && !isHovered) {
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

      {/* Continent Boundaries */}
      {createBoundaryLines()}

      {/* Grid Lines */}
      {createGridLines()}

      {/* Data Center Points */}
      {dataCenters.map((dc) => (
        <DataCenterPoint
          key={dc.key}
          position={latLngToVector3(dc.latitude, dc.longitude, earthRadius + 0.02)}
          dataCenter={dc}
          onHover={() => setIsHovered(true)}
          onLeave={() => setIsHovered(false)}
          onMobileClick={onMobileDataCenterClick}
          isMobile={isMobile}
          isTablet={isTablet}
        />
      ))}
    </group>
  )
}