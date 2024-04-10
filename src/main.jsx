import React from 'react'
import ReactDOM from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/custom.css'
import PagesRouter from './BasicComponents/PagesRouter.jsx';
import { Provider } from 'react-redux';
import store from './store.js';
import NavBar from './BasicComponents/NavBar.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
    <Provider store={store}>

    <PagesRouter/>
    </Provider>
   
      // </React.StrictMode>,
)
