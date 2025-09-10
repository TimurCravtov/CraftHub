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
import Items from './pages/Items.jsx'
import ShopPage from "./pages/ShopPage.jsx";
import Liked from './pages/Liked.jsx'
import { LikesProvider } from './likesContext.jsx'
import { CartProvider } from './cartContext.jsx'
import Cart from './pages/Cart.jsx'
import { ToastProvider } from './toastContext.jsx'
import Checkout from './pages/Checkout.jsx'
import Account from './pages/Account.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/en" replace />, // redirect root to default lang
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
    path: '/account',
    element: <Account />,
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
    path: '/shops/:id/Itempage',
    element: <ItemPage />,
  },
  {
    path: '/Itempage',
    element: <ItemPage />,
  },
  {
    path: '/items',
    element: <Items />,
  },
  {
    path: '/liked',
    element: <Liked />,
  },
  {
    path: '/cart',
    element: <Cart />,
  },
  {
    path: '/checkout',
    element: <Checkout />,
  },
  {
    path: "/:lang",
    element: <Home />,
    children: [
      { index: true, element: <Home /> },
      { path: "signup", element: <Signup /> },
      { path: "login", element: <Login /> },
      { path: "shops", element: <Shops /> },
      { path: "shops/:id", element: <ShopPage /> },
      { path: "shops/:id/Itempage", element: <ItemPage /> },
      { path: "Itempage", element: <ItemPage /> },
      { path: "items", element: <Items /> },
      { path: "liked", element: <Liked /> },
      { path: "cart", element: <Cart /> },
      { path: "checkout", element: <Checkout /> },
      { path: "*", element: <App /> },
    ],
  },
  {
    path: '*',
    element: <App />,
  },
])

createRoot(document.getElementById('root')).render(
    <StrictMode>
      <LikesProvider>
        <CartProvider>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </CartProvider>
      </LikesProvider>
    </StrictMode>
)
