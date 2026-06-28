import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppProvider } from '@/context/AppContext'
import { Layout } from '@/components/Layout'
import { HomePage } from '@/pages/HomePage'
import { ProgramEditorPage } from '@/pages/ProgramEditorPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { CardsHomePage } from '@/pages/CardsHomePage'
import { CardEditorPage } from '@/pages/CardEditorPage'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/programa/:id" element={<ProgramEditorPage />} />
            <Route path="/cartas" element={<CardsHomePage />} />
            <Route path="/cartas/:id" element={<CardEditorPage />} />
            <Route path="/configuracion" element={<SettingsPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  )
}
