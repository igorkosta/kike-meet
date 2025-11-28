import { Routes, Route } from "react-router-dom";
import './App.css'
import './index.css'
import Landing from './Landing.jsx'
import MeetUI from './MeetUI.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/meet" element={<MeetUI />} />
    </Routes>
  )
}

export default App
