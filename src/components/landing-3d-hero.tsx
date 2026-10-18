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
      45,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    )
    camera.position.z = 6

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    })
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    currentMount.appendChild(renderer.domElement)

    // 2. Geometry - Floating Futuristic Dining Rings & Floating Platter Torus
    const group = new THREE.Group()
    scene.add(group)

    // Central Torus Knot (Futuristic Shared Dining Nexus)
    const torusKnotGeo = new THREE.TorusKnotGeometry(1.2, 0.35, 120, 24, 2, 3)
    const torusKnotMat = new THREE.MeshPhysicalMaterial({
      color: 0xE50914,
      emissive: 0x4a0006,
      roughness: 0.15,
      metalness: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      wireframe: false
    })
    const torusKnot = new THREE.Mesh(torusKnotGeo, torusKnotMat)
    group.add(torusKnot)

    // Outer Wireframe Orbital Ring (Symbolizing Connected Stalls)
    const ringGeo = new THREE.TorusGeometry(2.3, 0.04, 16, 100)
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xF59E0B,
      emissive: 0x78350F,
      roughness: 0.3,
      metalness: 0.9,
      wireframe: true
    })
    const orbitalRing = new THREE.Mesh(ringGeo, ringMat)
    orbitalRing.rotation.x = Math.PI / 3
    group.add(orbitalRing)

    // Second Ring for Multi-Cafe Network
    const ringGeo2 = new THREE.TorusGeometry(2.7, 0.03, 16, 100)
    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0xFF4500,
      roughness: 0.4,
      metalness: 0.8,
      wireframe: true
    })
    const orbitalRing2 = new THREE.Mesh(ringGeo2, ringMat2)
    orbitalRing2.rotation.y = Math.PI / 4
    group.add(orbitalRing2)

    // 3. Floating Sparkle Particles (Simulating digital table orders in transit)
    const particleCount = 180
    const particleGeometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 10
      positions[i + 1] = (Math.random() - 0.5) * 10
      positions[i + 2] = (Math.random() - 0.5) * 8

      // Warm food court palette: Red, Amber, Gold, White
      const r = Math.random()
      if (r < 0.4) {
        // Red #E50914
        colors[i] = 0.9
        colors[i + 1] = 0.05
        colors[i + 2] = 0.08
      } else if (r < 0.7) {
        // Amber #F59E0B
        colors[i] = 0.96
        colors[i + 1] = 0.62
        colors[i + 2] = 0.04
      } else {
        // Warm White
        colors[i] = 1.0
        colors[i + 1] = 0.95
        colors[i + 2] = 0.9
      }
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    })

    const particles = new THREE.Points(particleGeometry, particleMaterial)
    scene.add(particles)

    // 4. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xff3b30, 3.5)
    keyLight.position.set(5, 5, 5)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xffa500, 2.5)
    fillLight.position.set(-5, -3, 3)
    scene.add(fillLight)

    const rimLight = new THREE.PointLight(0xffffff, 2.0, 10)
    rimLight.position.set(0, 4, 2)
    scene.add(rimLight)

    // 5. Mouse & Touch Interaction
    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0

    const handleMouseMove = (event: MouseEvent) => {
      const { innerWidth, innerHeight } = window
      mouseX = (event.clientX / innerWidth - 0.5) * 2
      mouseY = (event.clientY / innerHeight - 0.5) * 2
    }

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0]
        const { innerWidth, innerHeight } = window
        mouseX = (touch.clientX / innerWidth - 0.5) * 2
        mouseY = (touch.clientY / innerHeight - 0.5) * 2
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })

    // Resize Handler
    const handleResize = () => {
      if (!currentMount) return
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    // 6. Animation Loop (60 FPS)
    let animationFrameId: number
    const clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const elapsedTime = clock.getElapsedTime()

      // Smooth camera interpolation towards mouse/touch
      targetX = mouseX * 0.4
      targetY = mouseY * 0.3
      group.rotation.y += (targetX - group.rotation.y) * 0.05
      group.rotation.x += (-targetY - group.rotation.x) * 0.05

      // Continuous ambient rotation
      torusKnot.rotation.x = elapsedTime * 0.25
      torusKnot.rotation.y = elapsedTime * 0.35

      orbitalRing.rotation.z = elapsedTime * 0.15
      orbitalRing.rotation.x = Math.PI / 3 + Math.sin(elapsedTime * 0.5) * 0.1

      orbitalRing2.rotation.z = -elapsedTime * 0.2
      orbitalRing2.rotation.y = Math.PI / 4 + Math.cos(elapsedTime * 0.4) * 0.15

      // Gentle floating oscillation
      group.position.y = Math.sin(elapsedTime * 0.8) * 0.12

      // Rotate particle cloud slowly
      particles.rotation.y = elapsedTime * 0.03
      particles.rotation.x = elapsedTime * 0.015

      renderer.render(scene, camera)
    }

    animate()

    // 7. Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('resize', handleResize)

      torusKnotGeo.dispose()
      torusKnotMat.dispose()
      ringGeo.dispose()
      ringMat.dispose()
      ringGeo2.dispose()
      ringMat2.dispose()
      particleGeometry.dispose()
      particleMaterial.dispose()
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
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  )
}
