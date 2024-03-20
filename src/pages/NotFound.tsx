import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * Componente para exibir uma página de erro 404 (Não encontrado).
 *
 * Este componente é renderizado quando o usuário tenta acessar uma rota que não existe.
 * Ele exibe uma mensagem de erro 404 e fornece um botão para retornar à página anterior.
 *
 * @returns {JSX.Element} O componente NotFound.
 */
export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="w-full h-screen justify-center items-center flex flex-col gap-4 text-[var(--blue)]">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-8 left-[8vw] font-mybold text-black"
      >
        ⬅ VOLTAR
      </button>
      <h1 className="text-[2rem] font-bold">Erro 404</h1>
      <p>Esta página não existe</p>
    </div>
  );
}
