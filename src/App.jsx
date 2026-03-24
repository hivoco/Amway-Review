import { useState, useRef, useEffect, useCallback } from 'react'
import './App.css'

const INDIAN_LANGUAGES = [
  'All Languages',
  'English',
  'Hindi',
  'Bengali',
  'Telugu',
  'Marathi',
  'Tamil',
  'Urdu',
  'Gujarati',
  'Malayalam',
  'Kannada',
  'Odia',
  'Punjabi',
  'Assamese',
  'Maithili',
  'Sanskrit',
  'Konkani',
  'Nepali',
  'Manipuri',
  'Sindhi',
  'Dogri',
  'Kashmiri',
  'Santali',
  'Bodo',
]

const VIDEOS = [
  {
    id: 1,
    title: 'Asiya Rehmat & Waqar Afzal',
    src: 'https://videoforinteractivedemons.s3.ap-south-1.amazonaws.com/amway-review/Asiya+Rehmat+%26+Waqar+Afzal.mp4',
    language: 'English',
  },
  {
    id: 2,
    title: 'Babita Chithung & Mimi Wungnaoyo',
    src: 'https://videoforinteractivedemons.s3.ap-south-1.amazonaws.com/amway-review/Babita+Chithung+%26+Mimi+Wungnaoyo.mp4',
    language: 'Manipuri',
  },
]

function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function ProtectedVideo({ video, videoRef, otherRef }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const progressRef = useRef(null)

  // Time update
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onTimeUpdate = () => setCurrentTime(v.currentTime)
    const onLoadedMetadata = () => setDuration(v.duration)
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => setIsPlaying(false)

    v.addEventListener('timeupdate', onTimeUpdate)
    v.addEventListener('loadedmetadata', onLoadedMetadata)
    v.addEventListener('play', onPlay)
    v.addEventListener('pause', onPause)
    v.addEventListener('ended', onEnded)
    return () => {
      v.removeEventListener('timeupdate', onTimeUpdate)
      v.removeEventListener('loadedmetadata', onLoadedMetadata)
      v.removeEventListener('play', onPlay)
      v.removeEventListener('pause', onPause)
      v.removeEventListener('ended', onEnded)
    }
  }, [videoRef, hasStarted])

  const togglePlay = useCallback(() => {
    setHasStarted(true)
    // Wait a tick for video element to mount if first time
    setTimeout(() => {
      const v = videoRef.current
      if (!v) return
      if (v.paused) {
        if (otherRef.current && !otherRef.current.paused) {
          otherRef.current.pause()
        }
        v.play()
      } else {
        v.pause()
      }
    }, hasStarted ? 0 : 50)
  }, [videoRef, otherRef, hasStarted])

  const handleProgressClick = (e) => {
    const v = videoRef.current
    if (!v || !progressRef.current) return
    const rect = progressRef.current.getBoundingClientRect()
    const pos = (e.clientX - rect.left) / rect.width
    v.currentTime = pos * v.duration
  }

  const handleVolumeChange = (e) => {
    const v = videoRef.current
    if (!v) return
    const vol = parseFloat(e.target.value)
    v.volume = vol
    setVolume(vol)
    setIsMuted(vol === 0)
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    if (isMuted) {
      v.muted = false
      v.volume = volume || 0.5
      setIsMuted(false)
      setVolume(v.volume)
    } else {
      v.muted = true
      setIsMuted(true)
    }
  }

  const toggleFullscreen = () => {
    const wrapper = videoRef.current?.parentElement
    if (!wrapper) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      wrapper.requestFullscreen()
    }
  }

  const preventContextMenu = (e) => {
    e.preventDefault()
    return false
  }

  const progress = duration ? (currentTime / duration) * 100 : 0

  return (
    <div
      className="video-protected-wrapper aspect-video bg-black rounded-xl border border-[#E4E4E4] overflow-hidden shadow-sm"
      onContextMenu={preventContextMenu}
    >
      {hasStarted ? (
        <video
          ref={videoRef}
          src={video.src}
          preload="none"
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
          playsInline
          onContextMenu={preventContextMenu}
          onDragStart={(e) => e.preventDefault()}
          className="w-full h-full object-contain bg-black"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
          <svg className="w-16 h-16 text-white/40" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span className="text-white/30 text-sm">Click to play</span>
        </div>
      )}

      {/* Transparent overlay blocks direct interaction with video element */}
      <div className="video-overlay" onClick={togglePlay} onDoubleClick={toggleFullscreen} />

      {/* Custom controls */}
      <div className="custom-controls" onClick={(e) => e.stopPropagation()}>
        {/* Play/Pause */}
        <button onClick={togglePlay} title={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Progress bar */}
        <div
          ref={progressRef}
          className="progress-bar-container"
          onClick={handleProgressClick}
        >
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Time */}
        <span className="time-display">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {/* Volume */}
        <button onClick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
          {isMuted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          )}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="volume-slider"
        />

        {/* Fullscreen */}
        <button onClick={toggleFullscreen} title="Fullscreen">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function App() {
  const [selectedLanguage, setSelectedLanguage] = useState('All Languages')
  const video1Ref = useRef(null)
  const video2Ref = useRef(null)

  const filteredVideos =
    selectedLanguage === 'All Languages'
      ? VIDEOS
      : VIDEOS.filter((v) => v.language === selectedLanguage)

  // Block keyboard shortcuts for saving / downloading / devtools
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Block Ctrl+S / Cmd+S (save)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
      }
      // Block Ctrl+Shift+I / Cmd+Option+I (devtools)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
        e.preventDefault()
      }
      // Block Ctrl+U / Cmd+U (view source)
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault()
      }
      // Block F12
      if (e.key === 'F12') {
        e.preventDefault()
      }
      // Block Ctrl+Shift+C (inspect element)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault()
      }
      // Block Ctrl+Shift+J (console)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'J') {
        e.preventDefault()
      }
    }

    const handleDragStart = (e) => {
      if (e.target.tagName === 'VIDEO' || e.target.tagName === 'SOURCE') {
        e.preventDefault()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('dragstart', handleDragStart)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('dragstart', handleDragStart)
    }
  }, [])

  return (
    <div
      className="min-h-screen bg-white text-[#2C2C2C] no-select"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Header */}
      <header className="bg-white border-b border-[#E4E4E4] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#A65523] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <h1 className="text-xl md:text-2xl font-semibold text-[#2C2C2C] tracking-tight">
              Amway Business 
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-[#A65523] font-medium">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Video Review Portal
          </div>
        </div>
      </header>

      {/* Hero Banner with single language filter */}
      <div className="bg-linear-to-r from-[#FFF7EB] to-[#FFF1E8] border-b border-[#E4E4E4]">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-[#2C2C2C]">
              Video Comparison
            </h2>
            <p className="text-sm text-[#6B6B6B] mt-1">
              Review and compare videos by language
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-[#2C2C2C]">
              Language:
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-white border border-[#E4E4E4] rounded-lg px-3 py-2 text-sm text-[#2C2C2C] focus:outline-none focus:ring-2 focus:ring-[#A65523]/30 focus:border-[#A65523] cursor-pointer shadow-sm"
            >
              {INDIAN_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {filteredVideos.length === 0 ? (
          <div className="text-center py-20">
            <svg
              className="w-16 h-16 mx-auto text-[#E4E4E4] mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <p className="text-[#999] text-lg">
              No videos found for{' '}
              <span className="font-semibold text-[#A65523]">
                {selectedLanguage}
              </span>
            </p>
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 ${filteredVideos.length > 1 ? 'lg:grid-cols-2' : 'max-w-2xl mx-auto'} gap-8`}
          >
            {filteredVideos.map((video, index) => {
              const ref = index === 0 ? video1Ref : video2Ref
              const otherRef = index === 0 ? video2Ref : video1Ref

              return (
                <div key={video.id} className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E4E4E4]">
                    <div>
                      <h3 className="text-base font-semibold text-[#2C2C2C]">
                        {video.title}
                      </h3>
                      <p className="text-xs text-[#999] mt-0.5">
                        Video {index + 1}
                      </p>
                    </div>
                    <span className="text-xs bg-[#FFF7EB] text-[#A65523] border border-[#A65523]/20 px-2.5 py-1 rounded-full font-medium">
                      {video.language}
                    </span>
                  </div>

                  <ProtectedVideo
                    video={video}
                    videoRef={ref}
                    otherRef={otherRef}
                  />

                  <p className="text-xs text-[#999] truncate">
                    {video.title}.mp4
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E4E4E4] bg-[#FAFAFA] mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-xs text-[#999]">
          Amway Business Verification - Video Review Portal
        </div>
      </footer>
    </div>
  )
}

export default App
