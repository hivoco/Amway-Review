import { useState, useRef, useEffect } from 'react'
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
  {
    id: 3,
    title: 'Brightcove Video',
    src: 'https://players.brightcove.net/1437117781001/default_default/index.html?videoId=6391518383112',
    language: 'English',
    type: 'brightcove',
  },
]

function App() {
  const [selectedLanguage, setSelectedLanguage] = useState('All Languages')
  const iframeRefs = useRef({})

  const filteredVideos =
    selectedLanguage === 'All Languages'
      ? VIDEOS
      : VIDEOS.filter((v) => v.language === selectedLanguage)

  // Listen for play events from iframes to pause the other one
  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data?.type === 'videoPlaying') {
        const playingId = e.data.id
        // Pause all other iframes
        Object.entries(iframeRefs.current).forEach(([id, iframe]) => {
          if (Number(id) !== playingId && iframe?.contentWindow) {
            iframe.contentWindow.postMessage('pause', '*')
          }
        })
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Block keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') e.preventDefault()
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && 'IJC'.includes(e.key)) e.preventDefault()
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') e.preventDefault()
      if (e.key === 'F12') e.preventDefault()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
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
            {filteredVideos.map((video, index) => (
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

                <div className="aspect-video rounded-xl border border-[#E4E4E4] overflow-hidden shadow-sm bg-black">
                  {video.type === 'brightcove' ? (
                    <iframe
                      src={video.src}
                      className="w-full h-full border-0"
                      allowFullScreen
                      allow="encrypted-media"
                      title={video.title}
                    />
                  ) : (
                    <iframe
                      ref={(el) => (iframeRefs.current[video.id] = el)}
                      src={`/player.html?src=${encodeURIComponent(video.src)}&id=${video.id}`}
                      className="w-full h-full border-0"
                      allow="fullscreen"
                      sandbox="allow-scripts allow-same-origin"
                      title={video.title}
                    />
                  )}
                </div>

                <p className="text-xs text-[#999] truncate">
                  {video.title}.mp4
                </p>
              </div>
            ))}
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
