import React, { useEffect, useState } from 'react';
import { ref, uploadBytes } from 'firebase/storage';
import { storage } from '../firebase';
import { useNavigate } from 'react-router-dom';
import IscteLogo from '../content/imgs/logos/iscte.png';

export default function Home() {
    const navigate = useNavigate();

    // Array de ficheiros excel
    const [files, setFiles] = useState<any>(null);

    // Este useEffect só vai correr 1 vez, quando a página renderiza.
    // Serve para ir buscar ao firebase todos os ficheiros guardados 
    // no firestore (um bucket/cloud padrão para ficheiros).
    useEffect(() => {
        async function fetchData() {
            const githubRepoPath = 'rafaelcoias/ES-Project/contents/db';

            try {
                const response = await fetch(`https://api.github.com/repos/${githubRepoPath}`);
                const data = await response.json();
                const filesData = data.filter((file:any) => file.name.endsWith('.csv') || file.name.endsWith('.xls') || file.name.endsWith('.xlsx') || file.name.endsWith('.xlsm'))
                    .map((file:any) => ({
                        name: file.name,
                        url: file.download_url,
                    }));
                setFiles(filesData);
            } catch (error) {
                console.error('Error fetching files from GitHub', error);
            }
        }
        fetchData();
    }, []);

    // Quando o utilizador submete um ficheiro, verificamos se é um ficheiro excel,
    // se for, guardamos no array de ficheiros 'files' e guardamos no firebase-storage.
    // Caso não seja um ficheiro excel, aparece uma mensagem ao utilizador
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xls') || file.name.endsWith('.xlsx') || file.name.endsWith('.xlsm'))) {
            const storageRef = ref(storage, file.name);
            const snapshot = await uploadBytes(storageRef, file);
            void snapshot;
            if (files) setFiles((prev: any) => [...prev, file]);
            else setFiles([file])
            alert('Ficheiro adicionado!');
        } else {
            alert('Por favor escolha um ficheiro com formato excel.');
        }
    };

    // Aqui estará tudo o que será apresentado na página Home.
    return (
        <div className='w-full h-screen pt-[5rem] px-[8vw] flex flex-col gap-8 text-[var(--blue)]'>
            <img src={IscteLogo} alt="logo" className='w-[15rem]' />
            <h1 className='text-[1.5rem] quatro:text-[2rem] font-bold'>Bem-vindo de volta!</h1>
            <p className='text-black'>Ficheiros:</p>
            <div className='grid grid-cols-1 gap-4 oito:grid-cols-2'>
                {
                    files && files.length !== 0 ? files.map((file: any, index: number) => {
                        return (
                            <div key={index} onClick={() => navigate(`/file/${file.name}`, { state: { file: { file } } })} className='flex justify-between items-center bg-[var(--blue)] rounded-[25px] oito:h-[6rem] w-full text-white p-4 cursor-pointer border-[3px] border-[transparent] hover:border-black quatro:flex-row flex-col gap-4'>
                                <p className='flex flex-col w-full text-left'><span className=''>Nome: </span> {file?.name}</p>
                            </div>
                        )
                    }) :
                        <p className=''>Nenhum ficheiro guardado</p>
                }
            </div>
            <div className='flex justify-center w-full'>
                <div className='flex flex-col gap-4 border-2 border-black p-5 rounded-[20px] justify-center w-[18rem]'>
                    <p className='text-center'><span className='text-black'>+</span> Importar novo ficheiro</p>
                    <input type="file" onChange={handleFileChange} />
                </div>
            </div>
        </div>
    );
}

