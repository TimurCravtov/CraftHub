import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Signup from './pages/Signup.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Shops from './pages/Shops.jsx'
import ItemPage from "./pages/ItemPage.jsx";
import ShopPage from "./pages/ShopPage.jsx";
import Liked from './pages/Liked.jsx'
import { LikesProvider } from './likesContext.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/signup',
    element: <Signup />,
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
    path: '/shops/:id',
    element: <ShopPage />,
  },
  {
    path: '/items',
    element: <ItemPage />,
  },
  {
    path: '/liked',
    element: <Liked />,
  },
  {
    path: '*',
    element: <App />,
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LikesProvider>
      <RouterProvider router={router} />
    </LikesProvider>
  </StrictMode>
)
