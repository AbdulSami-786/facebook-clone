import { StrictMode } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Signup from './pages/Signup.jsx'
import Layout from './Layout.jsx'
import { store } from './redux/store/store.js'
import { Provider } from 'react-redux'
import Addpost from './pages/Addpost.jsx'
const router = createBrowserRouter([
  {
    path: '',
    element: <Layout/>,
    children: [
      {
        path: '',
        element: <App/>
      },
      {
        path: '/signup',
        element: <Signup/>
      },
      {
        path: '/addpost',
        element: <Addpost/>
      }
      ]
    }
  ])

createRoot(document.getElementById('root')).render(
  <StrictMode>
     <Provider store={store}>

    <RouterProvider router={router}/>
     </Provider>
  </StrictMode>,
)
