import Eyetest from './component/eyetest/Eyetest';
import SaveQuby from './component/savequby/SaveQuby';
import App from './App';
import Home from './Home';


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
    },
   {
        path: '/eyetest',
        element: <Eyetest />,
    },
   
    // {
    //     path: '*',
    //     element: <h2>404 - Page Not Found</h2>,
    // },
];


export default routes;