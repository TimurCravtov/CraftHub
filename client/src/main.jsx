import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Signup from './pages/Signup.jsx'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import Shops from './pages/Shops.jsx'
import ItemPage from './pages/ItemPage.jsx'
import Items from './pages/Items.jsx'
import ShopPage from './pages/ShopPage.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Liked from './pages/Liked.jsx'
import Settings from './pages/Settings.jsx'
import { LikesProvider } from './context/likesContext.jsx'
import { CartProvider } from './context/cartContext.jsx'
import Cart from './pages/Cart.jsx'
import { ToastProvider } from './context/toastContext.jsx'
import Checkout from './pages/Checkout.jsx'
import Account from './pages/Account.jsx'
import ManageShops from './pages/ManageShops.jsx'
import ShopOrders from './pages/ShopOrders.jsx'
import CreateShop from './pages/CreateShop.jsx'
import NotFound from './pages/NotFound.jsx'
import TooManyRequests from './pages/TooManyRequests.jsx'
import { TranslationProvider, useTranslation } from './context/translationContext.jsx'
import { SecurityProvider } from './context/securityContext.jsx'
import { AppConfigProvider } from './context/appConfigContext.jsx'

// 🔥 nou: redirect page pentru Google OAuth2
import Oauth2Redirect from './pages/Oauth2Redirect.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import ProtectedRoute from './component/ProtectedRoute.jsx'
import {AuthApiProvider} from "./context/apiAuthContext.jsx";

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
    element: <ProtectedRoute />,
    children: [
      {
        path: '/account',
        element: <Account />,
      },
      {
        path: '/account/shops',
        element: <ManageShops />,
      },
      {
        path: '/account/shops/:shopId',
        element: <Account />,
      },
      {
        path: '/account/shops/:shopId/orders',
        element: <ShopOrders />,
      },
      {
        path: '/create-shop',
        element: <CreateShop />,
      },
      {
        path: '/edit-shop/:shopId',
        element: <CreateShop />,
      },
    ]
  },
  {
    element: <ProtectedRoute allowedRoles={['ROLE_ADMIN']} />,
    children: [
      {
        path: '/admin/dashboard',
        element: <AdminDashboard />,
      },
    ]
  },
  {
    path: '/oauth/redirect/:provider',
    element: <Oauth2Redirect />,
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
    path: '/product/:shopUuid/:productUuid',
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
    path: '/404',
    element: <NotFound />,
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
      { path: 'product/:shopUuid/:productUuid', element: <ProductDetail /> },
      { path: 'liked', element: <Liked /> },
      { path: 'cart', element: <Cart /> },
      { path: 'checkout', element: <Checkout /> },
      { path: 'settings', element: <Settings /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    path: '/too-many-requests',
    element: <TooManyRequests />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
])

createRoot(document.getElementById('root')).render(
    <StrictMode>
      <SecurityProvider>
        <AppConfigProvider>
          <AuthApiProvider>
            <TranslationProvider>
              <LikesProvider>
                <CartProvider>
                  <ToastProvider>
                    <RouterProvider router={router} />
                  </ToastProvider>
                </CartProvider>
              </LikesProvider>
            </TranslationProvider>
          </AuthApiProvider>
        </AppConfigProvider>
      </SecurityProvider>
    </StrictMode>
)
