"use client"

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react"

interface EarthComponentProps {
  isMobile?: boolean
  isTablet?: boolean
  onMobileDataCenterClick?: (dataCenter: any) => void
}

export interface EarthComponentRef {
  zoomIn: () => void
  zoomOut: () => void
  resetZoom: () => void
  getCurrentZoom: () => number
}

export const EarthComponent = forwardRef<EarthComponentRef, EarthComponentProps>(
  ({ isMobile, isTablet, onMobileDataCenterClick }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const earthInstanceRef = useRef<any>(null)
    const isInitialized = useRef(false)
    const spritesCache = useRef<any[]>([])

    // Zoom state with improved configuration
    const zoomState = useRef({
      current: 1.4,
      min: 0.8,
      max: 6.0, // Reduced max to prevent extreme scaling issues
      step: 1.2,
      cameraAngleStep: 5
    })

    useImperativeHandle(ref, () => ({
      zoomIn: () => {
        if (earthInstanceRef.current) {
          const newZoom = Math.min(zoomState.current.current * zoomState.current.step, zoomState.current.max)
          zoomState.current.current = newZoom
          applyZoom(newZoom, zoomState.current.cameraAngleStep)
        }
      },
      zoomOut: () => {
        if (earthInstanceRef.current) {
          const newZoom = Math.max(zoomState.current.current / zoomState.current.step, zoomState.current.min)
          zoomState.current.current = newZoom
          applyZoom(newZoom, -zoomState.current.cameraAngleStep)
        }
      },
      resetZoom: () => {
        if (earthInstanceRef.current) {
          zoomState.current.current = 1.4
          applyZoom(1.4, 0)
        }
      },
      getCurrentZoom: () => zoomState.current.current,
    }))

    const applyZoom = (zoomLevel: number, cameraAngleAdjustment: number = 0) => {
      if (earthInstanceRef.current && earthInstanceRef.current.camera) {
        const baseDistance = 24
        const newDistance = baseDistance / zoomLevel
        
        // Apply camera distance adjustment
        if (earthInstanceRef.current.camera.position && earthInstanceRef.current.camera.position.setLength) {
          earthInstanceRef.current.camera.position.setLength(newDistance)
          
          // Apply camera angle adjustment
          if (cameraAngleAdjustment !== 0 && earthInstanceRef.current.camera.rotation) {
            earthInstanceRef.current.camera.rotation.x += (cameraAngleAdjustment * Math.PI) / 180
          }
          
          if (earthInstanceRef.current.camera.updateProjectionMatrix) {
            earthInstanceRef.current.camera.updateProjectionMatrix()
          }
        }
        
        // For high zoom levels, use uniform scaling instead of individual object scaling
        // This maintains sprite positions relative to the Earth
        if (zoomLevel > 2.0 && earthInstanceRef.current.scene) {
          const sceneScale = Math.min(zoomLevel / 2.0, 2.5) // Cap the scale to prevent extreme distortion
          
          // Apply scaling to the entire scene to maintain relative positions
          if (earthInstanceRef.current.scene.scale) {
            earthInstanceRef.current.scene.scale.set(sceneScale, sceneScale, sceneScale)
          }
        } else if (earthInstanceRef.current.scene && earthInstanceRef.current.scene.scale) {
          // Reset scale for normal zoom levels
          earthInstanceRef.current.scene.scale.set(1, 1, 1)
        }
        
        // Optimized update calls
        if (earthInstanceRef.current.render) {
          earthInstanceRef.current.render()
        }
      }
    }

    // Functions to control Earth interactivity
    const disableEarthInteraction = () => {
      if (earthInstanceRef.current) {
        // Disable auto rotation
        earthInstanceRef.current.autoRotate = false
        
        // Disable mouse/touch controls if available
        if (earthInstanceRef.current.controls) {
          earthInstanceRef.current.controls.enabled = false
        }
        
        // Disable drag functionality if available
        if (earthInstanceRef.current.enableDrag !== undefined) {
          earthInstanceRef.current.enableDrag = false
        }
      }
    }

    const enableEarthInteraction = () => {
      if (earthInstanceRef.current) {
        // Re-enable auto rotation
        earthInstanceRef.current.autoRotate = true
        
        // Re-enable mouse/touch controls if available
        if (earthInstanceRef.current.controls) {
          earthInstanceRef.current.controls.enabled = true
        }
        
        // Re-enable drag functionality if available
        if (earthInstanceRef.current.enableDrag !== undefined) {
          earthInstanceRef.current.enableDrag = true
        }
      }
    }

    // Optimized popup positioning
    const calculateSmartPopupPosition = (mouseX: number, mouseY: number, earthBounds: DOMRect) => {
      const popupWidth = 380
      const popupHeight = 500
      const margin = 20
      
      const earthSectionLeft = earthBounds.left
      const earthSectionRight = earthBounds.right
      const earthSectionTop = earthBounds.top
      const earthSectionBottom = earthBounds.bottom
      
      const spaceRight = earthSectionRight - mouseX
      const spaceLeft = mouseX - earthSectionLeft
      const spaceBelow = earthSectionBottom - mouseY
      const spaceAbove = mouseY - earthSectionTop
      
      let left = mouseX
      let top = mouseY
      
      // Horizontal positioning
      if (spaceRight >= popupWidth + margin) {
        left = mouseX + margin
      } else if (spaceLeft >= popupWidth + margin) {
        left = mouseX - popupWidth - margin
      } else {
        left = Math.max(
          earthSectionLeft + margin,
          Math.min(mouseX - popupWidth / 2, earthSectionRight - popupWidth - margin)
        )
      }
      
      // Vertical positioning
      if (spaceBelow >= popupHeight + margin) {
        top = mouseY + margin
      } else if (spaceAbove >= popupHeight + margin) {
        top = mouseY - popupHeight - margin
      } else {
        top = spaceBelow > spaceAbove 
          ? Math.max(mouseY - popupHeight + spaceBelow - margin, earthSectionTop + margin)
          : Math.min(mouseY - margin, earthSectionBottom - popupHeight - margin)
      }
      
      left = Math.max(earthSectionLeft + margin, Math.min(left, earthSectionRight - popupWidth - margin))
      top = Math.max(earthSectionTop + margin, Math.min(top, earthSectionBottom - popupHeight - margin))
      
      return { left, top }
    }

    // Cursor management functions
    const setCursor = (type: 'default' | 'pointer' | 'grab') => {
      if (containerRef.current) {
        containerRef.current.style.cursor = type
      }
    }

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

          // Optimized CSS with cursor management
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
              z-index: 9999;
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
              pointer-events: auto;
              border: 1px solid rgba(139, 92, 246, 0.3);
              backdrop-filter: blur(20px);
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              opacity: 0;
              transform: scale(0.95);
              transition: opacity 0.15s ease, transform 0.15s ease;
              overflow: hidden;
              cursor: default;
              will-change: transform, opacity;
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
              transition: background-color 0.15s ease;
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
              transition: transform 0.15s ease;
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
              transition: background-color 0.15s ease;
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

          if (containerRef.current) {
            containerRef.current.innerHTML = ""
            containerRef.current.appendChild(style)
            containerRef.current.appendChild(earthDiv)
            document.body.appendChild(popup)
          }

          if ((window as any).Earth) {
            // Simplified sizing - no unnecessary device detection
            const earthWidth = containerRef.current?.offsetWidth || window.innerWidth * 0.5
            const earthHeight = containerRef.current?.offsetHeight || window.innerHeight * 0.5

            const earth = new (window as any).Earth("earth-container", {
              mapImage: "ass-16.png",
              quality: 3, // Fixed quality for consistency
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

            // Set initial cursor
            setCursor('grab')

            // Apply initial zoom
            setTimeout(() => {
              applyZoom(1.4)
            }, 1000)

            const popupContent = popup.querySelector(".popup-content")
            let currentRegion: string | null = null
            let currentGroupData: any[] = []
            let currentExpandedIndex = 0
            let isVisible = false
            let mouseX = 0
            let mouseY = 0
            let hideTimer: NodeJS.Timeout | null = null
            let isHoveringDataCenter = false
            let isHoveringPopup = false
            let currentHoveredSprite: any = null

            function positionPopup() {
              if (!containerRef.current) return
              
              const earthBounds = containerRef.current.getBoundingClientRect()
              const pos = calculateSmartPopupPosition(mouseX, mouseY, earthBounds)
              
              popup.style.left = pos.left + "px"
              popup.style.top = pos.top + "px"
            }

            function showPopup(region: string, groupData: any[]) {
              if (hideTimer) {
                clearTimeout(hideTimer)
                hideTimer = null
              }

              if (isVisible && currentRegion === region) {
                return
              }

              isHoveringDataCenter = true
              setCursor('default')

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
                  // Only disable Earth interaction after popup is fully shown
                  setTimeout(() => {
                    if (isVisible) {
                      disableEarthInteraction()
                    }
                  }, 100)
                })
              }
            }

            function hidePopup() {
              if (hideTimer) clearTimeout(hideTimer)
              if (!isHoveringDataCenter && !isHoveringPopup) return

              hideTimer = setTimeout(() => {
                if (!isHoveringDataCenter && !isHoveringPopup) {
                  popup.classList.remove("visible")
                  setTimeout(() => {
                    popup.style.display = "none"
                    isVisible = false
                    currentRegion = null
                    isHoveringDataCenter = false
                    isHoveringPopup = false
                    currentHoveredSprite = null
                    setCursor('grab')
                    enableEarthInteraction()
                  }, 150)
                }
              }, 300)
            }

            function forceHidePopup() {
              if (hideTimer) clearTimeout(hideTimer)
              popup.classList.remove("visible")
              setTimeout(() => {
                popup.style.display = "none"
                isVisible = false
                currentRegion = null
                isHoveringDataCenter = false
                isHoveringPopup = false
                currentHoveredSprite = null
                setCursor('grab')
                enableEarthInteraction()
              }, 150)
            }

            function renderPopupContent() {
              if (!popupContent || !currentGroupData.length) return

              const firstDC = currentGroupData[0]
              const isMultiple = currentGroupData.length > 1

              const countryCode = firstDC.region.split(",")[1]?.trim()?.toLowerCase() || "un"
              const flagHtml = `<img src="https://flagcdn.com/w20/${countryCode}.png" alt="${countryCode} flag" onerror="this.style.display='none'; this.parentElement.innerHTML='🌍';" />`

              const regionParts = firstDC.region.split(",")
              const regionDisplay = regionParts.length >= 3 
                ? `${regionParts[0]},${regionParts[1]},${regionParts[2]}` 
                : firstDC.region

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
              if (index === currentExpandedIndex) return
              currentExpandedIndex = index
              renderPopupContent()
            }

            // Optimized mouse tracking
            let mouseTrackingRAF: number | null = null
            
            document.addEventListener("mousemove", (e) => {
              mouseX = e.clientX
              mouseY = e.clientY
              
              // Throttle popup positioning updates
              if (isVisible && popup.style.display === "block" && !mouseTrackingRAF) {
                mouseTrackingRAF = requestAnimationFrame(() => {
                  positionPopup()
                  mouseTrackingRAF = null
                })
              }
            })

            // CRITICAL FIX: Enhanced popup event handlers
            popup.addEventListener("mouseenter", () => {
              isHoveringPopup = true
              if (hideTimer) {
                clearTimeout(hideTimer)
                hideTimer = null
              }
              setCursor('default')
            })

            popup.addEventListener("mouseleave", () => {
              isHoveringPopup = false
              hidePopup()
            })

            // Add click handler to close popup when clicking outside
            document.addEventListener("click", (e) => {
              if (isVisible && !popup.contains(e.target as Node)) {
                const canvas = containerRef.current?.querySelector('canvas')
                if (canvas && canvas.contains(e.target as Node)) {
                  forceHidePopup()
                }
              }
            })

            // Optimized resize handler
            let resizeRAF: number | null = null
            window.addEventListener("resize", () => {
              if (isVisible && popup.style.display === "block" && !resizeRAF) {
                resizeRAF = requestAnimationFrame(() => {
                  positionPopup()
                  resizeRAF = null
                })
              }
            })

            // Optimized data fetching and sprite creation
            fetch("https://ic-api.internetcomputer.org/api/v3/data-centers")
              .then((res) => res.json())
              .then((data) => {
                const centers = data.data_centers.filter((dc: any) => dc.total_nodes > 0)
                const regionMap: { [key: string]: any[] } = {}

                centers.forEach((dc: any) => {
                  (regionMap[dc.region] ||= []).push(dc)
                })

                // Create sprites in batches to prevent blocking
                const regions = Object.keys(regionMap)
                let currentIndex = 0
                
                const createSpriteBatch = () => {
                  const batchSize = 5
                  const endIndex = Math.min(currentIndex + batchSize, regions.length)
                  
                  for (let i = currentIndex; i < endIndex; i++) {
                    const region = regions[i]
                    const group = regionMap[region]
                    const first = group[0]
                    const isMultiple = group.length > 1
                    const imageFile = isMultiple ? "multiple.png" : "single.png"

                    const sprite = earth.addSprite({
                      image: imageFile,
                      location: { lat: first.latitude, lng: first.longitude },
                      scale: 0.6, // Fixed scale for consistency
                      opacity: 1,
                      hotspot: true,
                    })

                    sprite.addEventListener("mouseover", () => {
                      if (currentHoveredSprite === sprite) return
                      currentHoveredSprite = sprite
                      isHoveringDataCenter = true
                      setCursor('default')
                      showPopup(region, group)
                    })

                    sprite.addEventListener("mouseout", () => {
                      if (currentHoveredSprite === sprite) {
                        currentHoveredSprite = null
                        isHoveringDataCenter = false
                        if (!isHoveringPopup) {
                          hidePopup()
                        }
                      }
                    })

                    sprite.addEventListener("click", (e) => {
                      e.stopPropagation()
                      if (onMobileDataCenterClick) {
                        onMobileDataCenterClick(first)
                      }
                    })

                    spritesCache.current.push(sprite)
                  }
                  
                  currentIndex = endIndex
                  
                  if (currentIndex < regions.length) {
                    // Continue with next batch
                    requestAnimationFrame(createSpriteBatch)
                  }
                }
                
                createSpriteBatch()
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
        // Cleanup
        if (earthInstanceRef.current?.destroy) {
          earthInstanceRef.current.destroy()
        }
        
        // Clear sprites cache
        spritesCache.current = []
        
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
          cursor: "grab"
        }}
      />
    )
  }
)

EarthComponent.displayName = "EarthComponent"