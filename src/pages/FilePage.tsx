import React from 'react';
// import { ref, uploadBytes } from 'firebase/storage';
// import { storage } from '../firebase';
import { exportExcel } from '../export';
import ExportIcon from '../content/imgs/icons/download.png'
import { useNavigate, useParams } from 'react-router-dom';

export default function FilePage() {
    const { name } = useParams();
    // const [file, setFile] = useState<any>(null);
    const navigate = useNavigate();

    function handleExport() {
        // TODO
        exportExcel([], 'all');
    }

    return (
        <div className='w-full h-screen pt-[5rem] px-[8vw] flex flex-col gap-8 text-[var(--blue)]'>
            <button onClick={() => navigate(-1)} className='absolute top-8 left-[8vw] font-mybold text-black'>⬅ VOLTAR</button>
            <div className='flex justify-between items-center seis:flex-row flex-col gap-8'>
                <h1 className='text-[2rem] font-bold text-black'>Ficheiro <span className='text-[var(--blue)]'>{name}</span></h1>
                <div className='flex flex-col gap-4 border-2 border-black p-5 rounded-[20px] w-[18rem]'>
                    <div className='w-full flex items-center gap-4 text-center justify-center'>
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

