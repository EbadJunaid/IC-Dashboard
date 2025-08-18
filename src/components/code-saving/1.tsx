"use client"

import { useEffect, useRef } from "react"

interface EarthComponentProps {
  isMobile?: boolean
  isTablet?: boolean
  onMobileDataCenterClick?: (dataCenter: any) => void
}

export const EarthComponent = ({ isMobile, isTablet, onMobileDataCenterClick }: EarthComponentProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const earthInstanceRef = useRef<any>(null)
  const isInitialized = useRef(false)

  useEffect(() => {
    if (isInitialized.current) return
    if (!containerRef.current) return

    const loadEarthScript = () => {
      return new Promise<void>((resolve, reject) => {
        if ((window as any).Earth) {
          resolve()
          return
        }

        const script = document.createElement("script")
        script.src = "/real-earth.js"
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error("Failed to load Earth script"))
        document.head.appendChild(script)
      })
    }

    const initializeEarth = async () => {
      try {
        await loadEarthScript()

        const earthDiv = document.createElement("div")
        earthDiv.id = "earth-container"
        earthDiv.style.width = "100%"
        earthDiv.style.height = "100%"
        earthDiv.style.position = "relative"

        const popup = document.createElement("div")
        popup.id = "earth-popup"
        popup.className = "earth-popup"
        popup.innerHTML = '<div class="popup-content"></div>'

        const style = document.createElement("style")
        style.textContent = `
          .earth-popup {
            position: fixed;
            background: linear-gradient(135deg, #2D1B69 0%, #1A0B3D 100%);
            color: #fff;
            border-radius: 12px;
            font-size: 14px;
            display: none;
            min-width: 320px;
            max-width: 380px;
            max-height: 80vh;
            z-index: 999999;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
            pointer-events: auto;
            border: 1px solid rgba(139, 92, 246, 0.3);
            backdrop-filter: blur(20px);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            opacity: 0;
            transform: scale(0.95);
            transition: opacity 0.2s ease, transform 0.2s ease;
            overflow: hidden;
          }

          .earth-popup.visible {
            opacity: 1;
            transform: scale(1);
          }

          .popup-header {
            padding: 16px 20px 12px 20px;
            border-bottom: 1px solid rgba(139, 92, 246, 0.2);
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .popup-flag {
            width: 20px;
            height: 15px;
            border-radius: 2px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #4F46E5;
          }

          .popup-flag img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .popup-region {
            color: #A78BFA;
            font-size: 13px;
            font-weight: 500;
          }

          .popup-body {
            padding: 0;
            max-height: calc(80vh - 60px);
            overflow-y: auto;
          }

          .popup-body::-webkit-scrollbar {
            width: 6px;
          }

          .popup-body::-webkit-scrollbar-track {
            background: rgba(139, 92, 246, 0.1);
            border-radius: 3px;
          }

          .popup-body::-webkit-scrollbar-thumb {
            background: rgba(139, 92, 246, 0.5);
            border-radius: 3px;
          }

          .popup-body::-webkit-scrollbar-thumb:hover {
            background: rgba(139, 92, 246, 0.7);
          }

          .datacenter-item {
            border-bottom: 1px solid rgba(139, 92, 246, 0.1);
          }

          .datacenter-item:last-child {
            border-bottom: none;
          }

          .datacenter-header {
            padding: 16px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            transition: background-color 0.2s ease;
          }

          .datacenter-header:hover {
            background: rgba(139, 92, 246, 0.1);
          }

          .datacenter-name {
            font-size: 18px;
            font-weight: 600;
            color: #FFFFFF;
          }

          .expand-icon {
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #A78BFA;
            transition: transform 0.2s ease;
          }

          .expand-icon.expanded {
            transform: rotate(180deg);
          }

          .datacenter-details {
            padding: 0 20px 16px 20px;
            display: none;
          }

          .datacenter-details.expanded {
            display: block;
          }

          .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid rgba(139, 92, 246, 0.1);
          }

          .detail-row:last-child {
            border-bottom: none;
          }

          .detail-label {
            color: #A78BFA;
            font-size: 13px;
            font-weight: 500;
          }

          .detail-value {
            color: #FFFFFF;
            font-size: 14px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .detail-id {
            color: #8B5CF6;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 12px;
          }

          .collapsed-item {
            padding: 12px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            transition: background-color 0.2s ease;
            border-bottom: 1px solid rgba(139, 92, 246, 0.1);
          }

          .collapsed-item:hover {
            background: rgba(139, 92, 246, 0.05);
          }

          .collapsed-item:last-child {
            border-bottom: none;
          }

          .collapsed-name {
            color: #E2E8F0;
            font-size: 16px;
            font-weight: 500;
          }

          .collapsed-icon {
            width: 16px;
            height: 16px;
            color: #64748B;
          }
        `

        function displayMessage(deviceType: string) {
          console.log(`I am a ${deviceType}`)
        }

        if (containerRef.current) {
          containerRef.current.innerHTML = ""
          containerRef.current.appendChild(style)
          containerRef.current.appendChild(earthDiv)
          document.body.appendChild(popup)
        }

        if ((window as any).Earth) {
          let earthWidth: number, earthHeight: number;

          if (isMobile) {
            displayMessage("mobile");
            earthWidth = window.innerWidth * 0.85;
            earthHeight = window.innerHeight * 0.35;
          } else if (isTablet) {
            displayMessage("tablet");
            earthWidth = window.innerWidth * 0.6;
            earthHeight = window.innerHeight * 0.45;
          } else {
            // Default case for desktops
            displayMessage("desktop");
            earthWidth = window.innerWidth * 0.45;
            earthHeight = window.innerHeight * 0.55;
          }

          const earth = new (window as any).Earth("earth-container", {
            mapImage: "ass-16.png",
            quality: isMobile ? 2 : isTablet ? 3 : 4,
            light: "none",
            autoRotate: true,
            autoRotateSpeed: 1.2,
            transparent: true,
            autoRotateDelay: 100,
            autoRotateStart: 2000,
            width: earthWidth,
            height: earthHeight,
          })

          earthInstanceRef.current = earth

          const popupContent = popup.querySelector(".popup-content")
          let currentRegion: string | null = null
          let currentGroupData: any[] = []
          let currentExpandedIndex = 0
          let isVisible = false
          let mouseX = 0
          let mouseY = 0
          let hideTimer: NodeJS.Timeout | null = null

          function calculatePosition() {
            const popupWidth = 350
            const popupHeight = 500
            const margin = 15

            let left = mouseX + margin
            let top = mouseY - 50

            if (left + popupWidth > window.innerWidth - 20) {
              left = mouseX - popupWidth - margin
            }

            if (top + popupHeight > window.innerHeight - 20) {
              top = mouseY - popupHeight + 50
            }

            if (left < 20) {
              left = 20
            }

            if (top < 20) {
              top = 20
            }

            return { left, top }
          }

          function positionPopup() {
            const pos = calculatePosition()
            popup.style.left = pos.left + "px"
            popup.style.top = pos.top + "px"
          }

          function showPopup(region: string, groupData: any[]) {
            console.log("showPopup:", region)

            if (hideTimer) {
              clearTimeout(hideTimer)
              hideTimer = null
            }

            if (isVisible && currentRegion === region) {
              console.log("Same region, no re-render")
              return
            }

            earth.autoRotate = false

            currentRegion = region
            currentGroupData = groupData
            currentExpandedIndex = 0

            renderPopupContent()

            if (!isVisible) {
              popup.style.display = "block"
              positionPopup()
              requestAnimationFrame(() => {
                popup.classList.add("visible")
                isVisible = true
              })
            }
          }

          function hidePopup() {
            console.log("hidePopup")

            if (hideTimer) clearTimeout(hideTimer)

            hideTimer = setTimeout(() => {
              popup.classList.remove("visible")
              setTimeout(() => {
                popup.style.display = "none"
                isVisible = false
                currentRegion = null
                earth.autoRotate = true
              }, 200)
            }, 300)
          }

          function renderPopupContent() {
            if (!popupContent || !currentGroupData.length) return

            console.log("renderPopupContent for:", currentRegion)

            const firstDC = currentGroupData[0]
            const isMultiple = currentGroupData.length > 1

            const countryCode = firstDC.region.split(",")[1]?.trim()?.toLowerCase() || "un"
            const flagHtml = `<img src="https://flagcdn.com/w20/${countryCode}.png" alt="${countryCode} flag" onerror="this.style.display='none'; this.parentElement.innerHTML='🌍';" />`

            const regionParts = firstDC.region.split(",")
            const regionDisplay =
              regionParts.length >= 3 ? `${regionParts[0]},${regionParts[1]},${regionParts[2]}` : firstDC.region

            let bodyHtml = ""

            if (isMultiple) {
              bodyHtml = currentGroupData
                .map((dc, index) => {
                  const isExpanded = index === currentExpandedIndex

                  if (isExpanded) {
                    return `
                    <div class="datacenter-item">
                      <div class="datacenter-header" data-index="${index}">
                        <div class="datacenter-name">${dc.name}</div>
                        <div class="expand-icon expanded">▼</div>
                      </div>
                      <div class="datacenter-details expanded">
                        <div class="detail-row">
                          <span class="detail-label">Data Center ID</span>
                          <span class="detail-value"><span class="detail-id">${dc.key}</span></span>
                        </div>
                        <div class="detail-row">
                          <span class="detail-label">Data Center Owner</span>
                          <span class="detail-value">${dc.owner}</span>
                        </div>
                        <div class="detail-row">
                          <span class="detail-label">Replica Nodes</span>
                          <span class="detail-value">${dc.total_replica_nodes || dc.total_nodes}</span>
                        </div>
                        <div class="detail-row">
                          <span class="detail-label">API Boundary Nodes</span>
                          <span class="detail-value">${dc.total_api_boundary_nodes || 0}</span>
                        </div>
                        <div class="detail-row">
                          <span class="detail-label">Total Nodes</span>
                          <span class="detail-value">${dc.total_nodes}</span>
                        </div>
                        <div class="detail-row">
                          <span class="detail-label">Node Providers</span>
                          <span class="detail-value">${dc.node_providers}</span>
                        </div>
                        <div class="detail-row">
                          <span class="detail-label">Subnets</span>
                          <span class="detail-value">${dc.subnets ? dc.subnets.length : 0}</span>
                        </div>
                      </div>
                    </div>
                  `
                  } else {
                    return `
                    <div class="collapsed-item" data-index="${index}">
                      <div class="collapsed-name">${dc.name}</div>
                      <svg class="collapsed-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  `
                  }
                })
                .join("")
            } else {
              const dc = firstDC
              bodyHtml = `
                <div class="datacenter-item">
                  <div class="datacenter-header">
                    <div class="datacenter-name">${dc.name}</div>
                    <div class="expand-icon expanded">▼</div>
                  </div>
                  <div class="datacenter-details expanded">
                    <div class="detail-row">
                      <span class="detail-label">Data Center ID</span>
                      <span class="detail-value"><span class="detail-id">${dc.key}</span></span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Data Center Owner</span>
                      <span class="detail-value">${dc.owner}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Replica Nodes</span>
                      <span class="detail-value">${dc.total_replica_nodes || dc.total_nodes}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">API Boundary Nodes</span>
                      <span class="detail-value">${dc.total_api_boundary_nodes || 0}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Total Nodes</span>
                      <span class="detail-value">${dc.total_nodes}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Node Providers</span>
                      <span class="detail-value">${dc.node_providers}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Subnets</span>
                      <span class="detail-value">${dc.subnets ? dc.subnets.length : 0}</span>
                    </div>
                  </div>
                </div>
              `
            }

            const fullHtml = `
              <div class="popup-header">
                <div class="popup-flag">${flagHtml}</div>
                <div class="popup-region">${regionDisplay}</div>
              </div>
              <div class="popup-body">${bodyHtml}</div>
            `

            if (popupContent) {
              popupContent.innerHTML = fullHtml
              if (isMultiple) {
                popupContent.querySelectorAll("[data-index]").forEach((el) => {
                  el.addEventListener("click", (e) => {
                    e.stopPropagation()
                    const index = Number.parseInt(el.getAttribute("data-index") || "0")
                    toggleDataCenter(index)
                  })
                })
              }
            }
          }

          function toggleDataCenter(index: number) {
            console.log("toggleDataCenter:", index)
            if (index === currentExpandedIndex) return
            currentExpandedIndex = index
            renderPopupContent()
          }

          document.addEventListener("mousemove", (e) => {
            mouseX = e.clientX
            mouseY = e.clientY
          })

          popup.addEventListener("mouseenter", () => {
            if (hideTimer) {
              clearTimeout(hideTimer)
              hideTimer = null
            }
          })

          popup.addEventListener("mouseleave", hidePopup)

          fetch("https://ic-api.internetcomputer.org/api/v3/data-centers")
            .then((res) => res.json())
            .then((data) => {
              const centers = data.data_centers.filter((dc: any) => dc.total_nodes > 0)
              const regionMap: { [key: string]: any[] } = {}

              centers.forEach((dc: any) => {
                ;(regionMap[dc.region] ||= []).push(dc)
              })

              Object.keys(regionMap).forEach((region) => {
                const group = regionMap[region]
                const first = group[0]
                const isMultiple = group.length > 1
                const imageFile = isMultiple ? "multiple.png" : "single.png"

                const sprite = earth.addSprite({
                  image: imageFile,
                  location: { lat: first.latitude, lng: first.longitude },
                  scale: isMobile ? 0.4 : isTablet ? 0.5 : 0.7,
                  opacity: 1,
                  hotspot: true,
                })

                sprite.addEventListener("mouseover", () => {
                  showPopup(region, group)
                })

                sprite.addEventListener("mouseout", hidePopup)

                sprite.addEventListener("click", () => {
                  if (onMobileDataCenterClick) {
                    onMobileDataCenterClick(first)
                  }
                })
              })
            })
            .catch(console.error)
        }
      } catch (error) {
        console.error("Error loading Earth script:", error)
      }
    }

    initializeEarth()
    isInitialized.current = true

    return () => {
      if (earthInstanceRef.current?.destroy) {
        earthInstanceRef.current.destroy()
      }
      const popup = document.getElementById("earth-popup")
      if (popup && popup.parentNode) {
        popup.parentNode.removeChild(popup)
      }
    }
  }, [isMobile, isTablet, onMobileDataCenterClick])

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "400px",
      }}
    />
  )
}