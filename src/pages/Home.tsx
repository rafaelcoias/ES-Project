import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import IscteLogo from "../content/imgs/logos/iscte.png";

/**
 * Componente para exibir a página inicial da aplicação.
 *
 * Este componente é responsável por exibir uma lista de arquivos carregados,
 * permitindo ao usuário visualizar, adicionar e excluir arquivos.
 *
 * @returns {JSX.Element} O componente Home.
 */
export default function Home() {
  const navigate = useNavigate();

  // Array de ficheiros excel
  const [files, setFiles] = useState<any>(null);

  // Este useEffect só vai correr 1 vez, quando a página renderiza.
  // Serve para ir buscar à base de dados local todos os ficheiros guardados
  // usando o backend
  useEffect(() => {
    fetch("/files")
      .then((response) => response.json())
      .then((data) => setFiles(data))
      .catch((error) => console.error("There was an error!", error));
  }, []);

  // Quando o utilizador submete um ficheiro, verificamos se é um ficheiro excel,
  // se for, guardamos no array de ficheiros 'files' e guardamos na base de dados local enviando para o backend.
  // Caso não seja um ficheiro excel, aparece uma mensagem ao utilizador a avisar que o ficheiro não é válido.
  /**
   * Função para lidar com a mudança de arquivo selecionado pelo usuário para upload.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event - O evento de mudança que ocorre quando um arquivo é selecionado.
   */
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (
      file &&
      (file.name.endsWith(".csv") ||
        file.name.endsWith(".xls") ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xlsm"))
    ) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await fetch("/upload", {
          method: "POST",
          body: formData,
        });
        if (response.ok) {
          alert("Ficheiro adicionado!");
        } else {
          alert("Upload do ficheiro falhou!");
        }
      } catch (error) {
        console.error("Upload do ficheiro falhou:", error);
        alert("Upload do ficheiro falhou!");
      }
      if (files) setFiles((prev: any) => [...prev, file]);
      else setFiles([file]);
    } else {
      alert("Por favor escolha um ficheiro com formato excel.");
    }
  };

  // Apaga um ficheiro da base de dados local e do array de ficheiros 'files'
  /**
   * Função assíncrona para deletar um arquivo.
   *
   * @param {string} fileName - O nome do arquivo a ser deletado.
   * @returns {void} - Esta função não retorna nenhum valor.
   */
  const deleteFile = async (fileName: string) => {
    if (!window.confirm("Tem a certeza que quer apagar este ficheiro?")) return;
    try {
      const response = await fetch(`/file/${fileName}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setFiles((prev: any) =>
          prev.filter((file: any) => file.name !== fileName)
        );
        alert("Ficheiro apagado!");
      } else {
        alert("Apagar ficheiro falhou!");
      }
    } catch (error) {
      console.error("Apagar ficheiro falhou:", error);
      alert("Apagar ficheiro falhou!");
    }
  };

  // Se ainda não houver ficheiros, aparece uma mensagem a dizer que está a carregar
  if (!files) {
    return (
      <div className="w-full h-screen pt-[5rem] px-[4vw] flex flex-col gap-8 text-[var(--blue)]">
        <h1 className="text-[2rem] font-bold text-black animate-bounce">
          A carregar...
        </h1>
      </div>
    );
  }

  // Aqui estará tudo o que será apresentado na página Home.
  return (
    <div className="w-full min-h-screen py-[5rem] px-[8vw] flex flex-col gap-8 text-[var(--blue)]">
      <img src={IscteLogo} alt="logo" className="w-[15rem]" />
      <h1 className="text-[1.5rem] quatro:text-[2rem] font-bold">
        Bem-vindo de volta!
      </h1>
      <button
        onClick={() => navigate("/MarcarAula")}
        className=" text-lg px-2 py-3 bg-[var(--blue)] text-white rounded-[13px] hover:bg-[var(--white)] hover:text-[var(--blue)] hover:border-[var(--blue)] border border-transparent transition-all duration-300">
        Marcar Aula de Substituição
      </button>
      <button
        onClick={() => navigate("/HeatMapGenerator")}
        className=" text-lg px-2 py-3 bg-[var(--blue)] text-white rounded-[13px] hover:bg-[var(--white)] hover:text-[var(--blue)] hover:border-[var(--blue)] border border-transparent transition-all duration-300">
        HeatMap
      </button> <button
        onClick={() => navigate("/NetworkGraphTest")}
        className=" text-lg px-2 py-3 bg-[var(--blue)] text-white rounded-[13px] hover:bg-[var(--white)] hover:text-[var(--blue)] hover:border-[var(--blue)] border border-transparent transition-all duration-300">
        NetworkGraphTest
      </button>
      <hr className="ml-16 w-[90%] border-gray-400 my-4" />
      <p className="text-black text-xl">Ficheiros:</p>
      <div className="grid grid-cols-1 gap-4 oito:grid-cols-2">
        {files && files.length !== 0 ? (
          files.map((file: any, index: number) => {
            return (
              <div
                key={index}
                className="flex justify-between items-center bg-[var(--blue)] rounded-[25px] oito:h-[6rem] w-full text-white p-4 cinco:flex-row flex-col gap-4"
              >
                <p className="flex flex-col w-full text-left max-w-[20rem] overflow-hidden">
                  <span className="font-bold text-lg">Nome: </span> {file?.name}
                </p>
                <div className="flex gap-2 cinco:flex-col">
                  <button
                    onClick={() => navigate(`/file/${file.name}`)}
                    className="rounded-[20px] px-4 py-1 border-white border-[2px] hover:bg-white hover:text-black transition-all duration-300"
                  >
                    abrir
                  </button>
                  <button
                    onClick={() => deleteFile(file?.name)}
                    className="border-[red] border-[2px] rounded-[20px] px-4 py-1 hover:bg-[red] transition-all duration-300"
                  >
                    remover
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="">Nenhum ficheiro guardado</p>
        )}
      </div>
      <div className="flex justify-center w-full">
        <div className="flex flex-col gap-4 border-2 border-black p-5 rounded-[20px] justify-center w-[18rem]">
          <p className="text-center">
            <span className="text-black">+</span> Importar novo ficheiro
          </p>
          <input type="file" onChange={handleFileChange} />
        </div>
      </div>
    </div>
  );
}
