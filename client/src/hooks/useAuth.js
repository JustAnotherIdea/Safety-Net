import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


//update for new refresh token
function useAuth() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = JSON.parse(atob(token.split('.')[1])); // Decode the payload
        const exp = decoded.exp * 1000; // Convert to milliseconds
        const now = Date.now();

        if (exp < now) {
          localStorage.removeItem('token'); // Remove expired token
          navigate('/login'); // Redirect to login page
        }
      }
    };

    // Check token expiration every minute (60000 milliseconds)
    const interval = setInterval(checkToken, 60000);
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [navigate]);
}

export default useAuth;
