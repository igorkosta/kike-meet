import { Routes, Route } from "react-router-dom";
import './App.css'
import './index.css'
import Landing from './Landing.jsx'
import MeetUI from './MeetUI.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MeetUI />} />
      <Route path="/landing" element={<Landing />} />
    </Routes>
  )
}

export default App
