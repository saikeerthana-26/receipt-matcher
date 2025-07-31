import React from 'react';
import Ledger from './components/Ledger';
import BankUpload from './components/BankUpload';

function App() {
  return (
    <div className="bg-white min-h-screen p-6">
      <Ledger />
      <BankUpload />
    </div>
  );
}

export default App;
