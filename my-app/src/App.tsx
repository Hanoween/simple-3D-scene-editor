import './App.css'
import { Layout } from 'antd'
import SidePanel from './components/side-panel'
import Scene from './components/scene'

function App() {

  return (
    <Layout>
      <Scene />
      <SidePanel />
    </Layout>
  )
}

export default App
