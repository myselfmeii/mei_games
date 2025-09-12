import { lazy } from 'react';
import qubynade from './assets/qubynade.webp';
import qubyeyetest from './assets/qubyeyetest.webp';
import qubythumbsup from './assets/qubythumbsup.gif';
import qubysong from './assets/qubysong.gif'
import InnerVoice from './component/innervoice/InnerVoice';
import qubyno from './assets/qubyno.gif';

const Home = lazy(() => import('./Home'));
const SaveQuby = lazy(() => import('./component/savequby/SaveQuby'));
const Eyetest = lazy(() => import('./component/eyetest/Eyetest'));
const NPAT = lazy(() => import('./component/npat/NPAT'));
const Dotx = lazy(() => import('./component/dotx/Dotx'));
const SongGame = lazy(() => import('./component/songgame/SongGame'));
const Resume = lazy(() => import('./component/resume/Resume'));

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
    img: qubynade,
  },
  {
    path: '/eyetest',
    element: <Eyetest />,
    img: qubyeyetest,
  },
  {
    path: '/songgame',
    element: <SongGame />,
    img: qubysong,
  },
    {
    path: '/innervoice',
    element: <InnerVoice />,
    img: qubyno,
  },
  {
    path: '/getintouch',
    element: <Resume />,
    // img: qubythumbsup,
  },
  // {
  //   path: '/dotsnbox',
  //   element: <Dotx />,
  //   img: qubythumbsup,
  // },
  // {
  //   path: '/npat/*',  //  will handle all NPAT sub-routes
  //   element: <NPAT />,
  // }
];

export default routes;
