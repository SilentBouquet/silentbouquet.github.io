import { Routes, Route, Navigate, useLocation } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import Home from './pages/Home'
import Notes from './pages/Notes'
import Essays from './pages/Essays'
import EssayReader from './pages/EssayReader'
import Write from './pages/Write'
import Fiction from './pages/Fiction'
import FictionReader from './pages/FictionReader'
import About from './pages/About'
import BackToTop from './components/BackToTop'

/** 路由切换时的淡入过渡 */
function Page({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

export default function App() {
  const location = useLocation()
  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Page><Home /></Page>} />
          <Route path="/notes" element={<Page><Notes /></Page>} />
          <Route path="/essays" element={<Page><Essays /></Page>} />
          <Route path="/essays/:slug" element={<Page><EssayReader /></Page>} />
          <Route path="/write" element={<Page><Write /></Page>} />
          <Route path="/fiction" element={<Page><Fiction /></Page>} />
          <Route path="/fiction/:slug" element={<Page><FictionReader /></Page>} />
          <Route path="/about" element={<Page><About /></Page>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      <BackToTop />
    </>
  )
}
