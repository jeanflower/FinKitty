'use client'

import { Auth0Provider } from 'contexts/auth0-context'
import App from '../App'

export default function Home() {
/*
  ReactDOM.preload(
    '/https://cdn.com/bootstrap.min.css',
    { as: 'style' },
  )
  ReactDOM.preload(
    '/https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css',
    { as: 'style' },
  )
*/
  return (
    <Auth0Provider>
      <App />
    </Auth0Provider>
  )
}
