import { HashRouter as BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import Dashboard from './pages/Dashboard'
import ForecastingView from './pages/ForecastingView'
import ReplenishmentView from './pages/ReplenishmentView'
import SimulationPanel from './pages/SimulationPanel'
import FeedbackLoop from './pages/FeedbackLoop'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-950">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/forecasting" element={<ForecastingView />} />
              <Route path="/replenishment" element={<ReplenishmentView />} />
              <Route path="/simulation" element={<SimulationPanel />} />
              <Route path="/feedback" element={<FeedbackLoop />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}
