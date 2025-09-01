import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import routes from './routesConfig';

const Home = () => {
  const navigate = useNavigate();

  const cards = useMemo(
    () => routes.filter(route => route.path !== '/' && route.path !== '/home'),
    []
  );

  const handleNavigate = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  return (
    <div style={{ padding: '20px' }}>
            <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        justifyContent: 'center'
      }}>
        {cards.map(({ path }) => (
          <div
            key={path}
            onClick={() => handleNavigate(path)}
            style={{
              flex: '1 1 200px',
              maxWidth: '250px',
              minWidth: '150px',
              height: '120px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '20px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              color: 'black',
              fontWeight: '600',
              fontSize: '18px',
              textAlign: 'center',
              backgroundColor: '#f9f9f9',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleNavigate(path)}
          >
            {path.replace('/', '').toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
