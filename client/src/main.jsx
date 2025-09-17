import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Signup from './pages/Signup.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Shops from './pages/Shops.jsx'
import ItemPage from './pages/ItemPage.jsx'
import Items from './pages/Items.jsx'
import ShopPage from './pages/ShopPage.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Liked from './pages/Liked.jsx'
import Settings from './pages/Settings.jsx'
import { LikesProvider } from './likesContext.jsx'
import { CartProvider } from './cartContext.jsx'
import Cart from './pages/Cart.jsx'
import { ToastProvider } from './toastContext.jsx'
import Checkout from './pages/Checkout.jsx'
import Account from './pages/Account.jsx'
import { TranslationProvider, useTranslation } from './context/translationContext.jsx'

// 🔥 nou: redirect page pentru Google OAuth2
import Oauth2Redirect from './pages/Oauth2Redirect.jsx'

function RedirectToLocale() {
  const { locale } = useTranslation()
  return <Navigate to={`/${locale}/home`} replace />
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RedirectToLocale />,
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
    path: '/oauth2/redirect',
    element: <Oauth2Redirect />, // 🔥 ruta pentru callback Google
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
    path: '/product/:shopId/:productId',
    element: <ProductDetail />,
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
    path: '/settings',
    element: <Settings />,
  },
  {
    path: '/:lang',
    element: <Home />,
    children: [
      { index: true, element: <Home /> },
      { path: 'signup', element: <Signup /> },
      { path: 'login', element: <Login /> },
      { path: 'shops', element: <Shops /> },
      { path: 'shops/:id', element: <ShopPage /> },
      { path: 'shops/:id/Itempage', element: <ItemPage /> },
      { path: 'Itempage', element: <ItemPage /> },
      { path: 'items', element: <Items /> },
      { path: 'product/:shopId/:productId', element: <ProductDetail /> },
      { path: 'liked', element: <Liked /> },
      { path: 'cart', element: <Cart /> },
      { path: 'checkout', element: <Checkout /> },
      { path: 'settings', element: <Settings /> },
      { path: '*', element: <App /> },
    ],
  },
  {
    path: '*',
    element: <App />,
  },
])

createRoot(document.getElementById('root')).render(
    <StrictMode>
      <TranslationProvider>
        <LikesProvider>
          <CartProvider>
            <ToastProvider>
              <RouterProvider router={router} />
            </ToastProvider>
          </CartProvider>
        </LikesProvider>
      </TranslationProvider>
    </StrictMode>
)
