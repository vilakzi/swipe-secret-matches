
import React from 'react';
import RootProviders from "@/components/providers/RootProviders";
import MainApp from "@/components/app/MainApp";

const App: React.FC = () => {
  console.log('App.tsx: App component rendering');
  
  return (
    <RootProviders>
      <MainApp />
    </RootProviders>
  );
};

export default App;
