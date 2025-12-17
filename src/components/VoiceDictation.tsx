'use client'

import { useState, useEffect, useRef } from 'react'

interface VoiceDictationProps {
  onTranscription: (text: string) => void
  isActive: boolean
  onToggle: () => void
}

export default function VoiceDictation({ onTranscription, isActive, onToggle }: VoiceDictationProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (SpeechRecognition) {
      setIsSupported(true)
      recognitionRef.current = new SpeechRecognition()

      const recognition = recognitionRef.current
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event: any) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            finalTranscript += result[0].transcript
          } else {
            interimTranscript += result[0].transcript
          }
        }

        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript + ' ')
          onTranscription(finalTranscript + ' ')
        }
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [onTranscription])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start()
      onToggle()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      onToggle()
    }
  }

  const clearTranscript = () => {
    setTranscript('')
  }

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-yellow-800 text-sm">
            Voice dictation is not supported in this browser. Try Chrome, Edge, or Safari for the best experience.
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          Voice Dictation
        </h3>

        <div className="flex items-center space-x-2">
          <button
            onClick={clearTranscript}
            className="text-sm text-gray-600 hover:text-gray-800 px-2 py-1 rounded"
            title="Clear transcript"
          >
            Clear
          </button>

          <button
            onClick={isListening ? stopListening : startListening}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
              isListening
                ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isListening ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.563A.562.562 0 019 14.437V9.563z" />
                </svg>
                <span>Stop Recording</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <span>Start Dictation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></div>
          <span className={`text-sm font-medium ${isListening ? 'text-red-600' : 'text-gray-600'}`}>
            {isListening ? 'Listening... Speak clearly into your microphone' : 'Ready to start dictation'}
          </span>
        </div>
      </div>

      {/* Transcript Display */}
      {transcript && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Transcript:</h4>
          <p className="text-gray-800 text-sm leading-relaxed">{transcript}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p><strong>Tips for best results:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>Speak clearly and at a moderate pace</li>
          <li>Use proper punctuation commands (e.g., "period", "comma", "new line")</li>
          <li>Dictate in complete sentences for better accuracy</li>
          <li>Minimize background noise for optimal recognition</li>
        </ul>
      </div>

      {/* Browser Support Note */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <strong>Best Experience:</strong> Use Chrome, Edge, or Safari for the most accurate voice recognition.
            Make sure your microphone is enabled and not muted.
          </div>
        </div>
      </div>
    </div>
  )
}


