import Eyetest from './component/eyetest/Eyetest';
import SaveQuby from './component/savequby/SaveQuby';
import App from './App';
import Home from './Home';
import qubynade from './assets/qubynade.webp';
import qubyeyetest from './assets/qubyeyetest.webp';



const routes = [
    {
        path: '/',
        element: <Home />,
       
    },
    {
        path: '/home',
        element: <Home />, 
    },
    {
        path: '/savequby',
        element: <SaveQuby />,
         img: qubynade
    },
   {
        path: '/eyetest',
        element: <Eyetest />,
         img: qubyeyetest
    },
   
    // {
    //     path: '*',
    //     element: <h2>404 - Page Not Found</h2>,
    // },
];


export default routes;