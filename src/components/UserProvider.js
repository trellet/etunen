import React from 'react';
import { createContext, useContext, useReducer } from 'react';

const UserContext = createContext(undefined);
const UserDispatchContext = createContext(undefined);

function userReducer(state, action) {
  switch (action.type) {
    case 'update':
      return {
        id: action.id,
        name: action.name,
        level: action.level,
        isModerator: ['moderator', 'admin'].includes(action.level),
        iRacingId: action.iRacingId,
        driverNumber: action.driverNumber
      };
    case 'logout':
      return null;
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

export function UserProvider({ children }) {
  const [state, dispatch] = useReducer(userReducer, null);

  return (
    <UserContext.Provider value={state}>
      <UserDispatchContext.Provider value={dispatch}>
        {children}
      </UserDispatchContext.Provider>
    </UserContext.Provider>
  );
}

export function useUserState() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserState must be used within a UserProvider');
  }
  return context;
}

export function useUserDispatch() {
  const context = useContext(UserDispatchContext);
  if (context === undefined) {
    throw new Error('useUserDispatch must be used within a UserProvider');
  }
  return context;
}