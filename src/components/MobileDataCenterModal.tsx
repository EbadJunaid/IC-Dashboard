"use client"

import { MapPin, Users, Server, Globe, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { DataCenter } from "@/types"

interface MobileDataCenterModalProps {
  dataCenter: DataCenter | null
  isOpen: boolean
  onClose: () => void
}

export function MobileDataCenterModal({ dataCenter, isOpen, onClose }: MobileDataCenterModalProps) {
  if (!isOpen || !dataCenter) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center md:hidden">
      <div className="bg-gray-900 border-t border-gray-700 rounded-t-2xl w-full max-h-[70vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{dataCenter.name}</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-white font-medium">Location</p>
              <p className="text-gray-400 text-sm">{dataCenter.region}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-white font-medium">Owner</p>
              <p className="text-gray-400 text-sm">{dataCenter.owner}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Server className="w-4 h-4 text-purple-400" />
                <span className="text-gray-400 text-sm">Total Nodes</span>
              </div>
              <p className="text-2xl font-bold text-white">{dataCenter.total_nodes}</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="text-gray-400 text-sm">Providers</span>
              </div>
              <p className="text-2xl font-bold text-white">{dataCenter.node_providers}</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Coordinates</p>
            <p className="text-white font-mono text-sm">
              {dataCenter.latitude.toFixed(4)}, {dataCenter.longitude.toFixed(4)}
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Replica Nodes</p>
            <p className="text-white text-lg font-semibold">{dataCenter.total_replica_nodes}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
