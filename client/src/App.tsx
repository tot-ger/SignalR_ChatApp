import { Routes, Route, Outlet, Link, useNavigate, useParams } from 'react-router-dom';
import { useContext, useEffect, useRef, useState } from 'react';
import UserProvider, { UserContext } from './context/userContext';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

export default function App() {

  return (
    <UserProvider>
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<Home />} />
          <Route path='login' element={<Login />} />
          <Route path='rooms' element={<Lobby />} />
          <Route path='rooms/:roomName' element={<Room />} />
        </Route>
      </Routes>
    </UserProvider>
  )
}

function Layout() {
  const { username, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/');
  }
  return (
    <div>
      <nav>
        {username ? (
          <>
            <Link to='/'>Home</Link>
            <Link to='rooms'>Rooms</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <Link to='/login'>Login</Link>
        )}
      </nav>
      <Outlet />
    </div>
  )
}

function Home() {
  return (
    <div>
      <h1>SignalR Chat App Demo - Home</h1>
    </div>
  )
}

function Login() {
  const { login, username } = useContext(UserContext);
  const [loginName, setLoginName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (username) {
      navigate('/');
    }
  }, [username]);

  const handleLogin = () => {
    login(loginName);
    setLoginName('');
  }
  return (
    <div>
      <h1>Login</h1>
      <input type='text' value={loginName} onChange={(e) => setLoginName(e.target.value)} placeholder='username' />
      <button onClick={handleLogin}>Login</button>
    </div>
  )
}

type RoomType = {
  name: string;
};

function Lobby() {
  const { username } = useContext(UserContext);
  const navigate = useNavigate();

  const [newRoomName, setNewRoomName] = useState('');
  const [rooms, setRooms] = useState<RoomType[]>([]);

  useEffect(() => {
    if (!username) {
      navigate('/login');
    }
  }, [username]);

  useEffect(() => {
    async function fetchRooms() {
      const url = `${import.meta.env.VITE_API_URL}/rooms`;
      const response = await fetch(url);
      const data: string[] = await response.json();
      setRooms(data.map((room: string) => ({ name: room })));
      
    }
    fetchRooms();
  }, []);

  const handleCreateRoom = async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ RoomName: newRoomName })
    });
    const data: string[] = await response.json()
    setRooms(data.map((room: string) => ({ name: room })));
  };

  return (
    <div>
      <h1>Lobby</h1>
      <input type='text' value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)} placeholder='room name' />
      <button onClick={handleCreateRoom}>Create Room</button>
      <ul>
        {rooms.map(room => (
          <li key={room.name}>
            <Link to={`/rooms/${room.name}`}>{room.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

type ChatMessage = {
  username: string;
  message: string;
};

function Room() {
  const { username } = useContext(UserContext);
  const navigate = useNavigate();

  const { roomName } = useParams();
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const activeRef = useRef(true);

  const handleReceiveMessage = (username: string, message: string) => {
    setMessages(messages => [...messages, { username, message }]);
  }

  useEffect(() => {
    if (!username) {
      navigate('/login');
    }
  }, [username]);

  useEffect(() => { 
    const connect = async () => {
      if (connection || !activeRef.current) return;
      const conn = new HubConnectionBuilder()
        .withUrl(`${import.meta.env.VITE_API_URL}/chat`)
        .withAutomaticReconnect()
        .build();
      
      conn.on('ReceiveMessage', handleReceiveMessage);

      try {
        await conn.start();
        await conn.invoke('JoinRoom', roomName, username);
        setConnection(conn);
      } catch (e) {
        console.error('Error connecting to chat hub', e);
      }
    }
    if (!connection) {
      connect();
    }

    return () => {
      activeRef.current = false;
      connection?.off('ReceiveMessage', handleReceiveMessage);
      connection?.stop().then(() => setConnection(null)).catch((e) => console.log(e));
    }
  }, [roomName, username]);

  const handleSendMessage = async () => {
    if (connection) {
      await connection.invoke('SendMessage', roomName, username, newMessage);
      console.log(newMessage);
      setNewMessage('');
    }
  }

  const handleLeaveRoom = async () => {
    if (connection) {
      await connection.invoke('LeaveRoom', roomName, username);
      navigate('/rooms');
    }
  }

  return (
    <div>
      <h1>Room: {roomName}</h1>
      <button onClick={handleLeaveRoom}>Leave Room</button>
      <ul>
        {messages.map((msg, idx) => (
          <li key={idx}>
            <strong>{msg.username}</strong>: {msg.message}
          </li>
        ))}
      </ul>
      <div>
        <input type='text' value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder='message' />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  )
}
