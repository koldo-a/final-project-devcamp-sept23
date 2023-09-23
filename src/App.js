import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './styles/App.scss';
import Home from './home';

const App = () => {
  const [email, setEmail] = useState('');
  const [idusers, setIdUsers] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [items, setItems] = useState([]);
  const [editMode] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');
  const [logoutMessage, setLogoutMessage] = useState('');
  const [registerMessage, setregisterMessage] = useState('');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const API_URL = process.env.REACT_APP_API_URL;

  const showLoginMessage = (message) => {
    setLoginMessage(message);
    setTimeout(() => {
      setLoginMessage('');
    }, 5000);
  };

  const showLogoutMessage = (message) => {
    setLogoutMessage(message);
    setTimeout(() => {
      setLoginMessage('');
    }, 5000);
  };

  const showregisterMessage = (message) => {
    setregisterMessage(message);
    setTimeout(() => {
      setregisterMessage('');
    }, 5000);
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/login`,
        { email: email },
        {
          timeout: 3000,
        }
      );
      if (response.status === 200) {
        showLoginMessage(response.data.message);
        setIsLoggedIn(true);
        localStorage.setItem('token', response.data.token);
        setIdUsers(response.data.idusers);
        fetchItems();
      }
    } catch (error) {
      showLoginMessage(error.response.data.message);
      console.error(error.response.data.message);
    }
  };

  const handleLogout = async () => {
  try {
    const response = await axios.get(`${API_URL}/logout`);
    console.log(response.data.message);
    showLogoutMessage(response.data.message); 
    setIsLoggedIn(false); 
    localStorage.removeItem('token'); // Eliminar el token de localStorage
    setItems([]); 
    navigate('/login');
    setEmail('');
    setIdUsers(null);
  } catch (error) {
    console.error(error.response.data.message);
  }
  };

  const handleRegister = async () => {
    try {
      const response = await axios.post(`${API_URL}/register`, { email: email });
      if (response.status === 200) {
        showregisterMessage(response.data.message);
        setEmail('');
      }
    } catch (error) {
      showregisterMessage(error.response.data.message);
      console.error(error.response.data.message);
    }
  };

  useEffect(() => {
    if (idusers !== null) {
      fetchItems();
    }
  }, [idusers]);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API_URL}/items`);
      setItems(response.data.filter(item => item.itemiduser === idusers));
      console.log(response.data);
      console.log(email)
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleSearch = () => {
    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      setItems(items.filter((item) => item.name.toLowerCase().includes(lowercasedSearchTerm)));
    } else {
      fetchItems();
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setSearchTerm(e.target.value);
  };

  const handleAddItem = async () => {
    if (inputValue) {
      try {
        const response = await axios.post(`${API_URL}/items`, { name: inputValue, itemiduser: idusers });
        setInputValue('');
        fetchItems();
      } catch (error) {
        console.error('Error adding item:', error);
      }
    }
  };

  const handleEditItem = (id) => {
    const newName = prompt('Enter the new value:');
    if (newName) {
      try {
        axios
          .put(`${API_URL}/items/${id}`, { name: newName })
          .then(() => fetchItems())
          .catch((error) => console.error('Error editing item:', error));
      } catch (error) {
        console.error('Error editing item:', error);
      }
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/items/${id}`);
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

useEffect(() => {
  console.log('useEffect is running');
  const token = localStorage.getItem('token'); // Obtener el token guardado en localStorage

  if (token) {
    // Verificar si el token existe
    setIsLoggedIn(true); // Establecer el estado de isLoggedIn en true
    // Realizar cualquier otra acción necesaria para manejar la sesión iniciada
  }
}, []);

  return (
    <div className='container1'>
      <Home />
      <div className='messages'>
        <div className={`login-msg ${registerMessage ? 'visible' : ''}`}>{registerMessage}</div>
        <div className={`login-msg ${loginMessage ? 'visible' : ''}`}>{loginMessage}</div>
        <div className={`login-msg ${logoutMessage ? 'visible' : ''}`}>{logoutMessage}</div>
      </div>
      {isLoggedIn ? (
        <div className='container'>
          <div className='container-heading'>
            <p>
              Welcome <b>{email}</b>! You are authenticated.
            </p>
            <button className='cerrar-button' onClick={handleLogout}>
              Logout
            </button>
          </div>
          <div className='subcontainer'>
            <input
              type='text'
              value={inputValue}
              onChange={handleInputChange}
              placeholder='Enter an item'
            />
            <button onClick={handleAddItem}>{editMode ? 'Save' : 'Add'}</button>
            
            <button onClick={handleSearch}>Search</button>
          </div>
          <ul className='listado-items'>
            {items.map((item) => (
              <li key={item.id}>
                <div className='texto-li'>
                  {item.name}
                  <div className='fecha-li'>{item.fecha}</div>
                </div>
                <div className='li-buttons'>
                  <button className='button-edit' onClick={() => handleEditItem(item.id)}>
                    Edit
                  </button>
                  <button onClick={() => handleDeleteItem(item.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className='login'>
          <input
            type='text'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='Email'
          />
          <button onClick={handleLogin}>Login</button>
          <button onClick={handleRegister}>Register</button>
        </div>
      )}

        <div className='author'>Author:&nbsp;<a href='koldo.arretxea@gmail.com>'>koldo.arretxea@gmail.com</a></div>
    </div>
  );
};

export default App;