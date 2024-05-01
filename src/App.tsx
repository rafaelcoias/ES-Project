import React from "react";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import FilePage from "./pages/FilePage";
import NotFoundPage from "./pages/NotFound";
import MarcarAula from "./pages/MarcarAula";
import HeatMapGenerator from "./pages/HeatMapGenerator";
import HeatMapTest from "./pages/HeatMapTest";
// Este é o ficheiro principal onde vai estar a App toda,
// É usado reac-router-dom para criar rotas
// de navegação pela App. Cada route é uma página diferente.
// O 'index' significa que é a route principal da app (root).
// O path define cada Route, se o URL estiver igual ao 'path',
// a app mostra a página referida em 'element'.
// O path='*' serve para qualquer route não definida.

/**
 * Componente principal da aplicação.
 *
 * Este componente é responsável por definir as rotas da aplicação utilizando o React Router.
 * Cada rota é associada a um componente que será renderizado quando o caminho corresponder ao URL atual.
 *
 * @returns {JSX.Element} O componente App.
 */
function App() {
  // Dados de exemplo: um array de objetos onde cada objeto tem uma propriedade "value"
  // representando a intensidade do heatmap para um determinado ponto
  const data = Array.from({ length: 7 * 16 }, (_, i) => ({
    value: Math.floor(Math.random() * 100), // Valor aleatório de 0 a 100
  }));
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/file/:name" element={<FilePage />} />
          <Route path="/MarcarAula" element={<MarcarAula />} />
          <Route path="/HeatMapGenerator" element={<HeatMapGenerator />} />
          <Route path="/HeatMapTest" element={<HeatMapTest  data={data}/>} />
          
          {/* <Route path="/Possibilidades" element={<MatchingResults/>} /> */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
