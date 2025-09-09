import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import routes from './routesConfig';

const App = () => {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {routes.map((route, index) => (
            <Route 
              key={route.path || index} 
              path={route.path} 
              element={route.element} 
            />
          ))}
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
