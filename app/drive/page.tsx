'use client'
// Drive display: speed + full-screen camera. NO on-screen notifications — everything is spoken.
import { useCallback, useEffect, useRef, useState } from 'react'
import { STOPS, HAZARDS, inBounds, distM } from '../../lib/route'

export default function Drive() {
  const [started, setStarted] = useState(false)
  const [kmh, setKmh] = useState<number | null>(null)
  const [camOn, setCamOn] = useState(true)
  const [voiceOn, setVoiceOn] = useState(true)
  const video = useRef<HTMLVideoElement>(null)
  const stream = useRef<MediaStream | null>(null)
  const fired = useRef(new Set<string>())
  const lastFix = useRef(0)
  const hadFix = useRef(false)
  const wasIn = useRef<boolean | null>(null)
  const voiceRef = useRef(true)
  voiceRef.current = voiceOn

  const say = useCallback((text: string, interrupt = false) => {
    if (!voiceRef.current || typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const ss = window.speechSynthesis
    if (interrupt) ss.cancel()
    const u = new SpeechSynthesisUtterance(text)
    const v = ss.getVoices()
    u.voice = v.find(x => x.lang === 'en-AU') || v.find(x => x.lang.startsWith('en')) || null
    u.lang = 'en-AU'
    ss.speak(u)
  }, [])

  // Traditional Owner recordings only play as supplied; never synthesised. Missing file = skipped silently.
  const playTO = useCallback((src?: string) => new Promise<void>(res => {
    if (!src) return res()
    const a = new Audio(src)
    a.onended = () => res(); a.onerror = () => res()
    a.play().catch(() => res())
  }), [])

  const startCamera = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      stream.current = s
      if (video.current) { video.current.srcObject = s; await video.current.play().catch(() => {}) }
      say('Camera on.')
    } catch { say('Camera unavailable.') }
  }, [say])

  const stopCamera = useCallback(() => {
    stream.current?.getTracks().forEach(t => t.stop()); stream.current = null
    if (video.current) video.current.srcObject = null
  }, [])

  useEffect(() => {
    if (!started) return
    if (camOn) startCamera(); else stopCamera()
    return () => stopCamera()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, camOn])

  useEffect(() => {
    if (!started || !('geolocation' in navigator)) return
    let wake: any
    ;(navigator as any).wakeLock?.request('screen').then((w: any) => (wake = w)).catch(() => {})
    const sim = new URLSearchParams(location.search).get('sim')
    say('Wayfinder started. Waiting for GPS.')
    const handle = (lat: number, lng: number, speedMs: number | null) => {
      lastFix.current = Date.now()
      if (!hadFix.current) { hadFix.current = true; say('GPS located.') }
      setKmh(speedMs == null || speedMs < 0 ? null : Math.round(speedMs * 3.6))
      const inside = inBounds(lat, lng)
      if (wasIn.current !== inside) {
        if (wasIn.current !== null || !inside)
          say(inside ? 'Entering the Wayfinder route.' : 'You are outside the Wayfinder route, Daintree Ferry to Cape Tribulation.')
        wasIn.current = inside
      }
      if (!inside) return
      for (const s of STOPS) if (!fired.current.has(s.id) && distM(lat, lng, s.lat, s.lng) <= s.radiusM) {
        fired.current.add(s.id)
        ;(async () => {
          if (s.id === 'ferry') await playTO(s.toAudio)
          say(s.speech)
          if (s.id === 'end') setTimeout(() => playTO(s.toAudio), 6000)
        })()
      }
      for (const h of HAZARDS) if (!fired.current.has(h.id) && distM(lat, lng, h.lat, h.lng) <= h.radiusM) {
        fired.current.add(h.id); say(h.speech)
      }
    }
    let simIdx = 0, simTimer: any
    let watch = -1
    if (sim) {
      simTimer = setInterval(() => {
        const p = STOPS[Math.min(simIdx++, STOPS.length - 1)]; handle(p.lat, p.lng, 22)
      }, 8000)
    } else {
      watch = navigator.geolocation.watchPosition(
        p => handle(p.coords.latitude, p.coords.longitude, p.coords.speed),
        () => say('GPS error.'), { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 })
    }
    const lost = setInterval(() => {
      if (hadFix.current && Date.now() - lastFix.current > 15000) { hadFix.current = false; say('GPS signal lost.') }
    }, 5000)
    return () => { if (watch >= 0) navigator.geolocation.clearWatch(watch); clearInterval(lost); clearInterval(simTimer); wake?.release?.(); window.speechSynthesis?.cancel() }
  }, [started, say, playTO])

  const btn: React.CSSProperties = { minHeight: 56, minWidth: 56, padding: '0 20px', borderRadius: 16, border: '1px solid #fff6', background: '#000a', color: '#fff', fontSize: 18, fontWeight: 700 }
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <video ref={video} playsInline muted style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: camOn && started ? 'block' : 'none' }} />
      {!started ? (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', padding: 24, textAlign: 'center' }}>
          <div>
            <h1 style={{ fontSize: 28, marginBottom: 8 }}>Daintree Wayfinder · Drive</h1>
            <p style={{ opacity: 0.8, marginBottom: 24 }}>Daintree Ferry to the end of the bitumen, Cape Tribulation. Speed on screen, everything else spoken.</p>
            <button style={{ ...btn, minHeight: 72, fontSize: 24, background: '#16a34a' }} onClick={() => { setStarted(true); window.speechSynthesis?.getVoices() }}>Start</button>
          </div>
        </div>
      ) : (
        <>
          <div aria-live="off" style={{ position: 'absolute', left: 0, right: 0, bottom: 96, textAlign: 'center', textShadow: '0 2px 12px #000' }}>
            <div style={{ fontSize: 'min(34vw, 40vh)', fontWeight: 800, lineHeight: 1 }}>{kmh ?? '--'}</div>
            <div style={{ fontSize: 28, opacity: 0.9 }}>km/h</div>
          </div>
          <div style={{ position: 'absolute', left: 16, right: 16, bottom: 16, display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button style={btn} onClick={() => setCamOn(c => !c)}>{camOn ? 'Camera on' : 'Camera off'}</button>
            <button style={btn} onClick={() => { const n = !voiceOn; if (!n) window.speechSynthesis?.cancel(); setVoiceOn(n) }}>{voiceOn ? 'Voice on' : 'Voice off'}</button>
          </div>
        </>
      )}
    </div>
  )
}
