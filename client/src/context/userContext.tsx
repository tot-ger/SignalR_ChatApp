import { createContext, useState } from "react";

type UserContextType = {
  username: string | null;
  login: (username: string) => void;
  logout: () => void;
};

export const UserContext = createContext<UserContextType>({
  username: null,
  login: () => {},
  logout: () => {},
});

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [username, setUsername] = useState<string | null>(null);
  const login = (username: string) => setUsername(username);
  const logout = () => setUsername(null);

  return (
    <UserContext.Provider value={{ username, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;