import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Landing from './pages/landing';
import Tables from './pages/tables';
import './App.css'

function App() {

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/tables" element={<Tables/>} />
    </Routes>
  )
}

export default App
