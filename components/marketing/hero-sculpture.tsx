"use client"

import * as React from "react"
import * as THREE from "three"
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js"

import { accentPalette } from "@/components/marketing/nodes"

type Pointer = { x: number; y: number; strength: number }

type HeroSculptureProps = {
  fractureRef: React.RefObject<number>
  pointerRef: React.RefObject<Pointer>
  reducedMotion: boolean
  onContextFailure: () => void
}

const NODE_COUNT = 40
const ACCENT_NODE_COUNT = 7

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// A ribbed normal map keeps the matte bodies from reading as flat plastic.
function createRibTexture() {
  const size = 128
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext("2d")
  if (!context) return null

  for (let y = 0; y < size; y += 1) {
    const wave = Math.sin((y / size) * Math.PI * 32)
    const g = Math.round(128 + wave * 42)
    context.fillStyle = `rgb(128, ${g}, 255)`
    context.fillRect(0, y, size, 1)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2, 2)
  return texture
}

function HeroSculpture({
  fractureRef,
  pointerRef,
  reducedMotion,
  onContextFailure,
}: HeroSculptureProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      })
    } catch {
      onContextFailure()
      return
    }

    const isMobile = window.matchMedia("(max-width: 767px)").matches
    const shardCount = isMobile ? 500 : 1500
    const dashCount = isMobile ? 120 : 300

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.setSize(parent.clientWidth, parent.clientHeight, false)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      34,
      parent.clientWidth / Math.max(parent.clientHeight, 1),
      0.1,
      60
    )
    camera.position.set(0, 0, 9)

    const group = new THREE.Group()
    group.scale.setScalar(reducedMotion ? 1 : 0.92)
    scene.add(group)

    scene.add(new THREE.AmbientLight(0xffffff, 0.35))
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4)
    keyLight.position.set(3.5, 4.5, 5)
    scene.add(keyLight)
    const rimLight = new THREE.DirectionalLight(0xbcd4ff, 1.5)
    rimLight.position.set(-5, -1.5, -3.5)
    scene.add(rimLight)

    const random = mulberry32(20260926)
    const ribTexture = createRibTexture()

    const nodePositions: THREE.Vector3[] = []
    for (let i = 0; i < NODE_COUNT; i += 1) {
      const radius = Math.cbrt(random())
      const theta = random() * Math.PI * 2
      const phi = Math.acos(2 * random() - 1)
      nodePositions.push(
        new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta) * radius * 2.15,
          Math.sin(phi) * Math.sin(theta) * radius * 1.45,
          Math.cos(phi) * radius * 1.2
        )
      )
    }
    nodePositions.sort((a, b) => a.x - b.x)

    const accentIndices = new Set<number>()
    for (let i = 0; i < ACCENT_NODE_COUNT; i += 1) {
      accentIndices.add(
        Math.min(
          NODE_COUNT - 1,
          Math.floor(NODE_COUNT * 0.35 + random() * NODE_COUNT * 0.6)
        )
      )
    }

    const bodyGeometry = new RoundedBoxGeometry(0.26, 0.26, 0.26, 3, 0.07)
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x8d8d8d,
      roughness: 0.55,
      metalness: 0.08,
      normalMap: ribTexture ?? undefined,
      normalScale: new THREE.Vector2(0.55, 0.55),
    })

    const plainIndices = nodePositions
      .map((_, index) => index)
      .filter((index) => !accentIndices.has(index))

    const bodies = new THREE.InstancedMesh(
      bodyGeometry,
      bodyMaterial,
      plainIndices.length
    )
    bodies.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    group.add(bodies)

    const accentMeshes: { mesh: THREE.Mesh; index: number }[] = []
    const accentMaterials: THREE.MeshStandardMaterial[] = []
    let accentSlot = 0
    accentIndices.forEach((index) => {
      const hex = accentPalette[accentSlot % accentPalette.length]
      accentSlot += 1
      const material = new THREE.MeshStandardMaterial({
        color: 0x3a3a3a,
        roughness: 0.4,
        emissive: new THREE.Color(hex),
        emissiveIntensity: 1.35,
        normalMap: ribTexture ?? undefined,
      })
      accentMaterials.push(material)
      const mesh = new THREE.Mesh(bodyGeometry, material)
      mesh.position.copy(nodePositions[index])
      group.add(mesh)
      accentMeshes.push({ mesh, index })
    })

    const edges: {
      mid: THREE.Vector3
      quaternion: THREE.Quaternion
      length: number
      from: number
    }[] = []
    const seen = new Set<string>()
    for (let i = 0; i < NODE_COUNT; i += 1) {
      const neighbours = nodePositions
        .map((position, index) => ({
          index,
          distance: position.distanceTo(nodePositions[i]),
        }))
        .filter((entry) => entry.index !== i)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 2)

      for (const neighbour of neighbours) {
        const key = [i, neighbour.index].sort().join("-")
        if (seen.has(key)) continue
        seen.add(key)

        const start = nodePositions[i]
        const end = nodePositions[neighbour.index]
        const direction = new THREE.Vector3().subVectors(end, start)
        const length = direction.length()
        const quaternion = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          direction.clone().normalize()
        )
        edges.push({
          mid: new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5),
          quaternion,
          length,
          from: Math.min(start.x, end.x),
        })
      }
    }

    const edgeGeometry = new THREE.CylinderGeometry(0.008, 0.008, 1, 6, 1, true)
    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: 0xb4b4b4,
      roughness: 0.7,
      transparent: true,
      opacity: 0.75,
    })
    const edgeMesh = new THREE.InstancedMesh(
      edgeGeometry,
      edgeMaterial,
      edges.length
    )
    edgeMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    group.add(edgeMesh)

    const shardGeometry = new THREE.BoxGeometry(1, 1, 1)
    const shardMaterial = new THREE.MeshBasicMaterial({
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    })
    const shards = new THREE.InstancedMesh(
      shardGeometry,
      shardMaterial,
      shardCount
    )
    shards.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    group.add(shards)

    const shardHome: THREE.Vector3[] = []
    const shardDrift: THREE.Vector3[] = []
    const shardSize: number[] = []
    const shardThreshold: number[] = []
    const shardSpin: number[] = []
    const shardColor = new THREE.Color()
    for (let i = 0; i < shardCount; i += 1) {
      const host = nodePositions[Math.floor(random() * NODE_COUNT)]
      shardHome.push(
        new THREE.Vector3(
          host.x + (random() - 0.5) * 0.5,
          host.y + (random() - 0.5) * 0.5,
          host.z + (random() - 0.5) * 0.5
        )
      )
      shardDrift.push(
        new THREE.Vector3(
          -1.6 - random() * 2.6,
          0.9 + random() * 2.4,
          (random() - 0.5) * 1.2
        )
      )
      shardSize.push(0.014 + random() * 0.03)
      shardThreshold.push(
        THREE.MathUtils.clamp((shardHome[i].x + 2.3) / 4.6, 0, 1) * 0.9
      )
      shardSpin.push(random() * Math.PI * 2)
      shardColor.set(accentPalette[Math.floor(random() * accentPalette.length)])
      shards.setColorAt(i, shardColor)
    }
    if (shards.instanceColor) shards.instanceColor.needsUpdate = true

    const dashGeometry = new THREE.PlaneGeometry(1, 1)
    const dashMaterial = new THREE.MeshBasicMaterial({
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    const dashes = new THREE.InstancedMesh(
      dashGeometry,
      dashMaterial,
      dashCount
    )
    dashes.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    scene.add(dashes)

    const dashSeed: {
      position: THREE.Vector3
      speed: number
      scale: number
    }[] = []
    for (let i = 0; i < dashCount; i += 1) {
      dashSeed.push({
        position: new THREE.Vector3(
          (random() - 0.5) * 11,
          (random() - 0.5) * 8,
          (random() - 0.5) * 3
        ),
        speed: 0.16 + random() * 0.4,
        scale: 0.3 + random() * 0.7,
      })
      shardColor.set(accentPalette[Math.floor(random() * accentPalette.length)])
      dashes.setColorAt(i, shardColor.multiplyScalar(0.45 + random() * 0.3))
    }
    if (dashes.instanceColor) dashes.instanceColor.needsUpdate = true

    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const scale = new THREE.Vector3()
    const pointerWorld = new THREE.Vector3()
    const repel = new THREE.Vector3()
    const identityQuaternion = new THREE.Quaternion()
    const spinAxis = new THREE.Vector3(0, 0, 1)

    function writeEdges(front: number) {
      edges.forEach((edge, index) => {
        const alive = edge.from > front ? 1 : 0
        scale.set(1, edge.length * alive, 1)
        matrix.compose(edge.mid, edge.quaternion, scale)
        edgeMesh.setMatrixAt(index, matrix)
      })
      edgeMesh.instanceMatrix.needsUpdate = true
    }

    function writeBodies(front: number) {
      plainIndices.forEach((nodeIndex, instanceIndex) => {
        const home = nodePositions[nodeIndex]
        const alive = home.x > front ? 1 : 0
        scale.setScalar(alive)
        matrix.compose(home, identityQuaternion, scale)
        bodies.setMatrixAt(instanceIndex, matrix)
      })
      bodies.instanceMatrix.needsUpdate = true

      accentMeshes.forEach(({ mesh, index }) => {
        mesh.visible = nodePositions[index].x > front
      })
    }

    function writeShards(front: number, time: number, pointer: Pointer) {
      pointerWorld.set(pointer.x * 4.4, pointer.y * 2.6, 0)

      for (let i = 0; i < shardCount; i += 1) {
        const home = shardHome[i]
        const progress = THREE.MathUtils.clamp(
          (front - home.x) / 1.6 + 0.001,
          0,
          1
        )
        if (progress <= 0) {
          scale.setScalar(0)
          matrix.compose(home, identityQuaternion, scale)
          shards.setMatrixAt(i, matrix)
          continue
        }

        const drift = shardDrift[i]
        position.set(
          home.x + drift.x * progress,
          home.y +
            drift.y * progress +
            Math.sin(time * 0.6 + shardSpin[i]) * 0.1,
          home.z + drift.z * progress
        )

        if (pointer.strength > 0) {
          repel.subVectors(position, pointerWorld)
          const distance = repel.length()
          if (distance < 1.3 && distance > 0.0001) {
            repel.multiplyScalar(
              ((1.3 - distance) / 1.3) * 0.55 * pointer.strength
            )
            position.add(repel)
          }
        }

        const size = shardSize[i] * (1 - progress * 0.35)
        scale.set(size, size * 0.55, size)
        quaternion.setFromAxisAngle(spinAxis, shardSpin[i] + time * 0.3)
        matrix.compose(position, quaternion, scale)
        shards.setMatrixAt(i, matrix)
      }
      shards.instanceMatrix.needsUpdate = true
    }

    function writeDashes(time: number) {
      for (let i = 0; i < dashCount; i += 1) {
        const seed = dashSeed[i]
        const y = ((seed.position.y + time * seed.speed + 4) % 8) - 4
        position.set(
          seed.position.x + Math.sin(time * 0.12 + i) * 0.35,
          y,
          seed.position.z
        )
        scale.set(0.09 * seed.scale, 0.016 * seed.scale, 1)
        matrix.compose(position, identityQuaternion, scale)
        dashes.setMatrixAt(i, matrix)
      }
      dashes.instanceMatrix.needsUpdate = true
    }

    let frame = 0
    let visible = true
    let intro = reducedMotion ? 1 : 0
    const clock = new THREE.Clock()

    function frontFrom(fracture: number, pointer: Pointer) {
      const base = THREE.MathUtils.lerp(-2.45, 2.55, fracture)
      return base + pointer.strength * pointer.x * 0.35
    }

    function renderFrame() {
      const delta = Math.min(clock.getDelta(), 0.05)
      const time = clock.elapsedTime
      const pointer = pointerRef.current ?? { x: 0, y: 0, strength: 0 }
      const fracture = reducedMotion ? 0.5 : (fractureRef.current ?? 0.35)
      const front = frontFrom(fracture, pointer)

      if (!reducedMotion) {
        intro = Math.min(1, intro + delta / 0.9)
        const eased = 1 - Math.pow(1 - intro, 4)
        group.scale.setScalar(0.92 + eased * 0.08)
        group.rotation.y += delta * 0.05
        group.rotation.x = Math.sin(time * 0.25) * 0.035
      }

      writeBodies(front)
      writeEdges(front)
      writeShards(front, time, pointer)
      writeDashes(reducedMotion ? 0 : time)

      accentMaterials.forEach((material, index) => {
        material.emissiveIntensity = reducedMotion
          ? 1.2
          : 1.1 + Math.sin(time * 1.2 + index) * 0.35
      })

      renderer.render(scene, camera)
    }

    function loop() {
      frame = requestAnimationFrame(loop)
      if (!visible || document.hidden) return
      renderFrame()
    }

    renderFrame()
    if (!reducedMotion) frame = requestAnimationFrame(loop)

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
      },
      { rootMargin: "120px" }
    )
    observer.observe(parent)

    const resizeObserver = new ResizeObserver(() => {
      const width = parent.clientWidth
      const height = Math.max(parent.clientHeight, 1)
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      if (reducedMotion) renderFrame()
    })
    resizeObserver.observe(parent)

    function onLost(event: Event) {
      event.preventDefault()
      cancelAnimationFrame(frame)
      onContextFailure()
    }
    canvas.addEventListener("webglcontextlost", onLost)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      resizeObserver.disconnect()
      canvas.removeEventListener("webglcontextlost", onLost)
      bodyGeometry.dispose()
      edgeGeometry.dispose()
      shardGeometry.dispose()
      dashGeometry.dispose()
      bodyMaterial.dispose()
      edgeMaterial.dispose()
      shardMaterial.dispose()
      dashMaterial.dispose()
      accentMaterials.forEach((material) => material.dispose())
      ribTexture?.dispose()
      renderer.dispose()
    }
  }, [fractureRef, onContextFailure, pointerRef, reducedMotion])

  return <canvas ref={canvasRef} aria-hidden className="size-full" />
}

export { HeroSculpture }
