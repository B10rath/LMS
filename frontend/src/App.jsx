import {Routes,Route,Navigate} from 'react-router-dom'
import {ToastContainer} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import UserDashboard from '@/pages/UserDashboard'
import AuthPage from '@/pages/Login'
import AdminDashboard from '@/pages/AdminDashboard'
import { useAuthContext } from '@/context/AuthContext'

function App() {
  const { authUser } = useAuthContext();
  return (
    <>
      <Routes>
        <Route path="/" element={authUser?(authUser.role === 'admin' ? <AdminDashboard /> : <UserDashboard />):<Navigate to='/login'/>} />
        <Route path="/login" element={<AuthPage />} />
      </Routes>
    <ToastContainer />
    </>
  )
}

export default App
