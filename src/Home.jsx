import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import routes from './routesConfig';
import CustomText from './component/common/CustomText';


const Home = () => {
  const navigate = useNavigate();

  const cards = useMemo(
    // () => routes.filter(route => route.path !== '/' && route.path !== '/home'),
    () => routes.filter(route => !['/', '/home', '/getintouch'].includes(route.path)), // to hide the contact dev card
    []
  );

  const handleNavigate = useCallback((path) => {
    navigate(path);
  }, [navigate]);

 const handleContactDeveloper = () => {
    navigate('/getintouch');
  };

  return (
    <div style={{ padding: '20px', position: 'relative' }}>
      <CustomText  phrases={['Welcome to ', 'Mei Games']} delay={1000} />
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
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              color: 'black',
              fontWeight: '600',
              fontSize: '18px',
              textAlign: 'center',
              backgroundImage: `url(${routes.find(route => route.path === path)?.img})`,
              cursor: 'pointer',
              transition: 'transform 0.2s',
              backgroundSize: 'contain', 
              backgroundPosition: 'right center',
              backgroundRepeat: 'no-repeat',
              border: '1px solid #dadadaff'
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleNavigate(path)}
          >
            {path === "/npat/*" ? "Name Game" : path.replace('/', '').toUpperCase()}
          </div>
        ))}
      </div>

      
      <button
        onClick={handleContactDeveloper}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '12px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '30px',
          cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          fontWeight: '600',
          fontSize: '14px',
          zIndex: 1000,
          transition: 'background-color 0.3s ease'
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#007bff'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f08400ff'}
      >
        Get in Touch
      </button>
    </div>
  );
};

export default Home;
