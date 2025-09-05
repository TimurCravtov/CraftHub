import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Login from './pages/Login.jsx'
import Shops from './pages/Shops.jsx'
import ItemPage from "./pages/ItemPage.jsx";

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/shops" replace />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/shops',
    element: <Shops />,
  },
  {
    path: '/items',
    element: <ItemPage />,
  },
  {
    path: '*',
    element: <App />,
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
