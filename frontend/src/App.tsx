import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';

import { Home } from './pages/Home';
import { PaginaPessoas } from './pages/Pessoas';
import { PaginaCategorias } from './pages/Categorias';
import { PaginaTransacoes } from './pages/Transacoes';
import { PaginaRelatorios } from './pages/Relatorios';

function App() {
 return (
  <BrowserRouter>
   <MainLayout>
    <Routes>
     <Route path="/" element={<Home />} />
     <Route path="/pessoas" element={<PaginaPessoas />} />
     <Route path="/categorias" element={<PaginaCategorias />} />
     <Route path="/transacoes" element={<PaginaTransacoes />} />
     <Route path="/relatorios" element={<PaginaRelatorios />} />
    </Routes>
   </MainLayout>
  </BrowserRouter>
 );
}

export default App;