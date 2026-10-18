'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Apple, Smartphone, Download, Check, Share, PlusSquare, ArrowRight, ExternalLink } from 'lucide-react'
import Image from 'next/image'

function AndroidIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5896 8.4239 13.849 8.1678 12 8.1678s-3.5896.2561-5.1368.7828L4.8409 5.4477a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396" />
    </svg>
  )
}

interface AppInstallModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: 'apple' | 'android'
}

export function AppInstallModal({ isOpen, onClose, defaultTab = 'android' }: AppInstallModalProps) {
  const [platform, setPlatform] = useState<'apple' | 'android'>(defaultTab)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    setPlatform(defaultTab)
  }, [defaultTab])

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
  }, [])

  const handleNativePwaInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setIsInstallable(false)
        onClose()
      }
    } else {
      window.location.href = '/partner'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-3xl p-6 sm:p-7 bg-[#0E1118] text-white border border-white/10 shadow-2xl">
        <DialogHeader className="text-center space-y-2">
          <div className="relative w-14 h-14 mx-auto overflow-hidden rounded-2xl border border-white/10 shadow-lg">
            <Image
              src="/images/logo.png"
              alt="PlazaBite Icon"
              fill
              className="object-cover"
            />
          </div>
          <DialogTitle className="text-xl font-semibold text-white tracking-tight">
            Install PlazaBite
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-400">
            Install directly on your phone without going through the App Store or Google Play.
          </DialogDescription>
        </DialogHeader>

        {/* Platform Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white/[0.05] rounded-xl my-4 border border-white/[0.06]">
          <button
            type="button"
            onClick={() => setPlatform('android')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              platform === 'android' ? 'bg-[#E50914] text-white shadow-xs' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <AndroidIcon className="w-4 h-4" />
            <span>Android</span>
          </button>
          <button
            type="button"
            onClick={() => setPlatform('apple')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              platform === 'apple' ? 'bg-[#E50914] text-white shadow-xs' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Apple size={15} />
            <span>Apple iOS</span>
          </button>
        </div>

        {/* ANDROID CONTENT */}
        {platform === 'android' ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Instant Direct Install</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                Install PlazaBite directly onto your home screen. Opens in a native standalone window with high-priority order alerts.
              </p>

              <button
                type="button"
                onClick={handleNativePwaInstall}
                className="w-full h-11 rounded-xl bg-white text-zinc-900 hover:bg-zinc-100 font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download size={15} />
                <span>Add to Home Screen</span>
              </button>
            </div>

            <div className="text-[11px] text-zinc-500 space-y-1.5 px-1">
              <p className="font-medium text-zinc-400">Prefer a standalone .APK file?</p>
              <p className="leading-relaxed">
                You can also compile or download the direct signed Android package from our GitHub repository releases without Google Play.
              </p>
              <a
                href="https://github.com/azhiif/plazabite"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#E50914] hover:underline font-semibold pt-1"
              >
                <span>View Source & APK on GitHub</span>
                <ExternalLink size={11} />
              </a>
            </div>
          </div>
        ) : (
          /* APPLE IOS CONTENT */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
              <span className="text-xs font-semibold text-white block">
                How to Install on iPhone / iPad:
              </span>

              <ol className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-white/[0.08] text-white flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Open <strong className="text-white">Safari</strong> on your iPhone and visit <code className="text-red-400 font-mono text-[11px]">plazabite.vercel.app</code>
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-white/[0.08] text-white flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5">
                    2
                  </span>
                  <span className="flex items-center gap-1.5 flex-wrap">
                    Tap the <strong className="text-white">Share</strong> button (<Share size={12} className="inline text-blue-400" />) at the bottom of Safari
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-white/[0.08] text-white flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    Scroll down and tap <strong className="text-white">&ldquo;Add to Home Screen&rdquo;</strong>
                  </span>
                </li>
              </ol>

              <div className="pt-2 border-t border-white/[0.06] text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium">
                <Check size={13} />
                <span>Installs with full-screen experience & zero App Store login</span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
