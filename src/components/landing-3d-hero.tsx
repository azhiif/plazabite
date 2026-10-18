'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function Landing3DHero() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const currentMount = mountRef.current
    if (!currentMount) return

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      42,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 0, 5.2)

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    })
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    currentMount.appendChild(renderer.domElement)

    // 2. Minimalist Architectural 3D Sculpture
    const group = new THREE.Group()
    scene.add(group)

    // Sleek faceted torus in dark obsidian with crimson specular highlight
    const mainGeometry = new THREE.TorusGeometry(1.4, 0.28, 32, 100)
    const mainMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x111318,
      emissive: 0x050608,
      roughness: 0.2,
      metalness: 0.9,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15
    })
    const mainMesh = new THREE.Mesh(mainGeometry, mainMaterial)
    mainMesh.rotation.x = Math.PI * 0.35
    group.add(mainMesh)

    // Secondary delicate inner accent ring (clean vermilion highlight)
    const innerGeometry = new THREE.TorusGeometry(1.0, 0.02, 16, 80)
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: 0xE50914,
      transparent: true,
      opacity: 0.65
    })
    const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial)
    innerMesh.rotation.x = -Math.PI * 0.25
    group.add(innerMesh)

    // Subtle outer halo ring (soft wireframe)
    const outerGeometry = new THREE.TorusGeometry(1.85, 0.015, 12, 90)
    const outerMaterial = new THREE.MeshBasicMaterial({
      color: 0x334155,
      transparent: true,
      opacity: 0.4,
      wireframe: true
    })
    const outerMesh = new THREE.Mesh(outerGeometry, outerMaterial)
    outerMesh.rotation.y = Math.PI * 0.3
    group.add(outerMesh)

    // 3. Studio Lighting - Tasteful, Soft, Clean
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0)
    keyLight.position.set(4, 5, 4)
    scene.add(keyLight)

    const redRimLight = new THREE.PointLight(0xE50914, 3.0, 8)
    redRimLight.position.set(-3, -2, 2)
    scene.add(redRimLight)

    const fillLight = new THREE.DirectionalLight(0x64748b, 1.2)
    fillLight.position.set(0, -4, 2)
    scene.add(fillLight)

    // 4. Smooth Interaction (Mouse & Touch)
    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 1.5
      mouseY = (e.clientY / window.innerHeight - 0.5) * 1.5
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0]
        mouseX = (touch.clientX / window.innerWidth - 0.5) * 1.5
        mouseY = (touch.clientY / window.innerHeight - 0.5) * 1.5
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })

    const handleResize = () => {
      if (!currentMount) return
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    // 5. Calm, Cinematic Animation Loop
    let animId: number
    const clock = new THREE.Clock()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      // Soft damping towards mouse/touch
      targetX = mouseX * 0.25
      targetY = mouseY * 0.2
      group.rotation.y += (targetX - group.rotation.y) * 0.04
      group.rotation.x += (-targetY - group.rotation.x) * 0.04

      // Gentle, calm drift
      mainMesh.rotation.z = t * 0.1
      innerMesh.rotation.z = -t * 0.14
      outerMesh.rotation.z = t * 0.08
      group.position.y = Math.sin(t * 0.7) * 0.08

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('resize', handleResize)

      mainGeometry.dispose()
      mainMaterial.dispose()
      innerGeometry.dispose()
      innerMaterial.dispose()
      outerGeometry.dispose()
      outerMaterial.dispose()
      renderer.dispose()

      if (currentMount && renderer.domElement) {
        try {
          currentMount.removeChild(renderer.domElement)
        } catch {}
      }
    }
  }, [])

  return (
    <div 
      ref={mountRef} 
      className="absolute inset-0 w-full h-full pointer-events-none -z-10 opacity-70"
      aria-hidden="true"
    />
  )
}
