import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminView from './components/AdminView';
import AdminManage from './components/AdminManage';

const App = () => {
    return (

          <Routes>
              <Route path="/admin/view-orders" element={<AdminView />} />
              <Route path="/admin/manage-orders/:id" element={<AdminManage />} />
          </Routes>

    );
};

export default App;