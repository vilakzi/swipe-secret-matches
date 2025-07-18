
import React from 'react';
import RootProviders from "@/components/providers/RootProviders";
import MainApp from "@/components/app/MainApp";

const App = () => {
  return (
    <RootProviders>
      <MainApp />
    </RootProviders>
  );
};

export default App;
