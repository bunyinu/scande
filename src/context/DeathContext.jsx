import React, { createContext, useContext, useReducer } from 'react';

const DeathContext = createContext();

const initialState = {
  user: null,
  currentPrediction: null,
  marketData: null,
  isScanning: false,
  scanProgress: 0,
  deathDate: null,
  causeOfDeath: null,
  confidence: 0,
  timeRemaining: null,
  marketPool: 0,
  bets: [],
  subscriptions: [],
  loading: false,
  error: null,
};

const deathReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'START_SCANNING':
      return { ...state, isScanning: true, scanProgress: 0 };
    
    case 'UPDATE_SCAN_PROGRESS':
      return { ...state, scanProgress: action.payload };
    
    case 'SET_DEATH_PREDICTION':
      return {
        ...state,
        currentPrediction: action.payload,
        deathDate: action.payload.deathDate,
        causeOfDeath: action.payload.cause,
        confidence: action.payload.confidence,
        isScanning: false,
        scanProgress: 100,
      };
    
    case 'SET_MARKET_DATA':
      return {
        ...state,
        marketData: action.payload,
        marketPool: action.payload.total_pool || 0,
        bets: action.payload.bets || [],
      };
    
    case 'ADD_BET':
      return {
        ...state,
        bets: [...state.bets, action.payload],
        marketPool: state.marketPool + action.payload.amount,
      };
    
    case 'UPDATE_TIME_REMAINING':
      return { ...state, timeRemaining: action.payload };
    
    case 'SET_SUBSCRIPTIONS':
      return { ...state, subscriptions: action.payload };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'EXTEND_LIFE':
      return {
        ...state,
        deathDate: action.payload.newDeathDate,
        timeRemaining: action.payload.newTimeRemaining,
      };
    
    default:
      return state;
  }
};

export const DeathProvider = ({ children }) => {
  const [state, dispatch] = useReducer(deathReducer, initialState);

  const actions = {
    setUser: (user) => dispatch({ type: 'SET_USER', payload: user }),
    
    startScanning: () => dispatch({ type: 'START_SCANNING' }),
    
    updateScanProgress: (progress) => 
      dispatch({ type: 'UPDATE_SCAN_PROGRESS', payload: progress }),
    
    setDeathPrediction: (prediction) => 
      dispatch({ type: 'SET_DEATH_PREDICTION', payload: prediction }),
    
    setMarketData: (data) => 
      dispatch({ type: 'SET_MARKET_DATA', payload: data }),
    
    addBet: (bet) => dispatch({ type: 'ADD_BET', payload: bet }),
    
    updateTimeRemaining: (time) => 
      dispatch({ type: 'UPDATE_TIME_REMAINING', payload: time }),
    
    setSubscriptions: (subs) => 
      dispatch({ type: 'SET_SUBSCRIPTIONS', payload: subs }),
    
    setLoading: (loading) => 
      dispatch({ type: 'SET_LOADING', payload: loading }),
    
    setError: (error) => dispatch({ type: 'SET_ERROR', payload: error }),
    
    clearError: () => dispatch({ type: 'CLEAR_ERROR' }),
    
    extendLife: (newData) => 
      dispatch({ type: 'EXTEND_LIFE', payload: newData }),
  };

  return (
    <DeathContext.Provider value={{ ...state, ...actions }}>
      {children}
    </DeathContext.Provider>
  );
};

export const useDeathContext = () => {
  const context = useContext(DeathContext);
  if (!context) {
    throw new Error('useDeathContext must be used within a DeathProvider');
  }
  return context;
};

export default DeathContext;
