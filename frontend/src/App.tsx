import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';

import { Home } from './pages/Home';
import { PeoplePage } from './pages/People';
import { CategoriesPage } from './pages/Categories';
import { TransactionsPage } from './pages/Transactions';
import { ReportsPage } from './pages/Reports';

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/people" element={<PeoplePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
