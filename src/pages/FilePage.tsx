import React from 'react';
import { exportExcel } from '../export';
import ExportIcon from '../content/imgs/icons/download.png'
import { useNavigate, useParams } from 'react-router-dom';

export default function FilePage() {
    const navigate = useNavigate();

    // Vamos buscar o nome do ficheiro que queremos apresentar na página
    const { name } = useParams();

    // Esta função chama a função de exportar.
    // Os dados são trabalhados e enviados para a função exportExcel
    // A função exportExcel recebe um array de objectos (cada elemento do array é uma linha de excel)
    function handleExport() {
        // TODO: trabalhar os dados que serao enviados para o excel (formato array)
        exportExcel([], 'all');
    }

    // Aqui estará tudo o que será apresentado na página FilePage.
    return (
        <div className='w-full h-screen pt-[5rem] px-[8vw] flex flex-col gap-8 text-[var(--blue)]'>
            <button onClick={() => navigate(-1)} className='absolute top-8 left-[8vw] font-mybold text-black'>⬅ VOLTAR</button>
            <div className='flex flex-col items-center justify-between gap-8 seis:flex-row'>
                <h1 className='text-[2rem] font-bold text-black'>Ficheiro <span className='text-[var(--blue)]'>{name}</span></h1>
                <div className='flex flex-col gap-4 border-2 border-black p-5 rounded-[20px] w-[18rem]'>
                    <div className='flex items-center justify-center w-full gap-4 text-center'>
                        <img src={ExportIcon} alt="icon" className='w-6' />
                        Exportar ficheiro
                    </div>
                    <div className='flex justify-center'>
                        <button className='w-[8rem] px-4 py-1 rounded-full bg-[var(--blue)] text-white' onClick={handleExport}>exportar</button>
                    </div>
                </div>
            </div>
            <div className='h-1 w-full bg-[var(--blue)]'></div>
        </div>
    );
}

