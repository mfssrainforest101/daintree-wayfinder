'use client'
import { useWayfinderStore } from '../store'

export default function Controls() {
  const {
    waypoints,
    playbackState,
    progress,
    speed,
    setPlaybackState,
    setSpeed,
    resetPlayback,
    clearWaypoints,
    removeWaypoint,
  } = useWayfinderStore()

  const hasRoute = waypoints.length >= 2
  const canPlay = hasRoute && playbackState !== 'playing'
  const canPause = playbackState === 'playing'
  const canStop = playbackState !== 'idle'

  function handlePlay() {
    if (!hasRoute) return
    if (progress >= 1) {
      useWayfinderStore.getState().setProgress(0)
    }
    setPlaybackState('playing')
  }

  function handlePause() {
    setPlaybackState('paused')
  }

  function handleStop() {
    resetPlayback()
  }

  const pct = Math.round(progress * 100)

  return (
    <aside className="controls-panel">
      {/* Header */}
      <div className="panel-header">
        <span className="panel-icon">🌿</span>
        <div>
          <h1 className="panel-title">Daintree Wayfinder</h1>
          <p className="panel-subtitle">Daintree Rainforest, QLD</p>
        </div>
      </div>

      {/* Instruction */}
      <div className="hint-box">
        <span className="hint-icon">📍</span>
        <p className="hint-text">
          Click anywhere on the map to add waypoints, then press Play to animate the route.
        </p>
      </div>

      {/* Playback controls */}
      <section className="section">
        <h2 className="section-title">Playback</h2>

        <div className="btn-row">
          <button
            className={`btn btn-play ${canPlay ? '' : 'btn-disabled'}`}
            onClick={handlePlay}
            disabled={!canPlay}
            title={!hasRoute ? 'Add at least 2 waypoints first' : 'Play route'}
          >
            ▶ Play
          </button>
          <button
            className={`btn btn-pause ${canPause ? '' : 'btn-disabled'}`}
            onClick={handlePause}
            disabled={!canPause}
            title="Pause"
          >
            ⏸ Pause
          </button>
          <button
            className={`btn btn-stop ${canStop ? '' : 'btn-disabled'}`}
            onClick={handleStop}
            disabled={!canStop}
            title="Stop and reset to start"
          >
            ⏹ Stop
          </button>
        </div>

        {/* Progress bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="progress-label">{pct}%</span>
        </div>

        {/* State badge */}
        <div className={`state-badge state-${playbackState}`}>
          {playbackState === 'idle' && '● Idle'}
          {playbackState === 'playing' && '▶ Playing'}
          {playbackState === 'paused' && '⏸ Paused'}
        </div>
      </section>

      {/* Speed control */}
      <section className="section">
        <h2 className="section-title">Speed</h2>
        <div className="speed-row">
          {[0.5, 1, 2, 4].map((s) => (
            <button
              key={s}
              className={`btn btn-speed ${speed === s ? 'btn-speed-active' : ''}`}
              onClick={() => setSpeed(s)}
            >
              {s}×
            </button>
          ))}
        </div>
      </section>

      {/* Waypoints */}
      <section className="section waypoints-section">
        <div className="section-header-row">
          <h2 className="section-title">
            Waypoints <span className="count-badge">{waypoints.length}</span>
          </h2>
          {waypoints.length > 0 && (
            <button
              className="btn btn-clear"
              onClick={clearWaypoints}
              title="Remove all waypoints"
            >
              Clear all
            </button>
          )}
        </div>

        {waypoints.length === 0 ? (
          <p className="empty-text">No waypoints yet. Click the map to add some.</p>
        ) : (
          <ul className="waypoint-list">
            {waypoints.map((wp, i) => (
              <li key={wp.id} className="waypoint-item">
                <span className="wp-index">{i + 1}</span>
                <span className="wp-name">{wp.name}</span>
                <span className="wp-coords">
                  {wp.lat.toFixed(4)}, {wp.lng.toFixed(4)}
                </span>
                <button
                  className="btn btn-remove"
                  onClick={() => removeWaypoint(wp.id)}
                  title="Remove waypoint"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {!hasRoute && waypoints.length === 1 && (
        <div className="info-box">Add one more waypoint to enable playback.</div>
      )}
    </aside>
  )
}
