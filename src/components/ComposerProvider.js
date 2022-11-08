import { createContext, useContext, useReducer } from 'react';

const ComposerContext         = createContext(undefined);
const ComposerDispatchContext = createContext(undefined);

function userReducer(state, action) {
  switch (action.type) {
    case 'update':
      return {
        id: action.id,
        name: action.name,
        level: action.level,
        isModerator: ['moderator', 'admin'].includes(action.level)
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
    <ComposerContext.Provider value={state}>
      <ComposerDispatchContext.Provider value={dispatch}>
        {children}
      </ComposerDispatchContext.Provider>
    </ComposerContext.Provider>
  );
}


export function useComposerState() {
  const context = useContext(ComposerContext);
  if (context === undefined) {
    throw new Error('useComposerState must be used within a UserProvider');
  }
  return context;
}


export function useComposerDispatch() {
  const context = useContext(ComposerDispatchContext);
  if (context === undefined) {
    throw new Error('useComposerDispatch must be used within a UserProvider');
  }
  return context;
}