import React from 'react';

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import FilePage from './pages/FilePage';
import NotFoundPage from './pages/NotFound';

// Este é o ficheiro principal onde vai estar a App toda,
// É usado reac-router-dom para criar rotas
// de navegação pela App. Cada route é uma página diferente.
// O 'index' significa que é a route principal da app (root).
// O path define cada Route, se o URL estiver igual ao 'path',
// a app mostra a página referida em 'element'.
// O path='*' serve para qualquer route não definida. 
function App() {
	return (
		<>
			<BrowserRouter>
				<Routes>
					<Route index element={<Home />} />
					<Route path="/file/:name" element={<FilePage />} />
					<Route path="*" element={<NotFoundPage />} />
				</Routes>
			</BrowserRouter>
		</>
	);
}

export default App;
