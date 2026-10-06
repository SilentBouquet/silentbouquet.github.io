import { Routes, Route, Navigate } from 'react-router'
import Home from './pages/Home'
import Notes from './pages/Notes'
import Essays from './pages/Essays'
import EssayReader from './pages/EssayReader'
import Write from './pages/Write'
import Fiction from './pages/Fiction'
import FictionReader from './pages/FictionReader'
import About from './pages/About'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/notes" element={<Notes />} />
      <Route path="/essays" element={<Essays />} />
      <Route path="/essays/:slug" element={<EssayReader />} />
      <Route path="/write" element={<Write />} />
      <Route path="/fiction" element={<Fiction />} />
      <Route path="/fiction/:slug" element={<FictionReader />} />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
