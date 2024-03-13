import React, { useEffect, useState } from 'react';
import { getMetadata, listAll, ref, uploadBytes } from 'firebase/storage';
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
            const listRef = ref(storage, '/');
            try {
                const res = await listAll(listRef);
                const filesData = await Promise.all(
                    res.items.map(async (itemRef) => {
                        const metadata = await getMetadata(itemRef);
                        return {
                            name: itemRef.name,
                            lastModifiedDate: metadata.updated
                        };
                    })
                );
                const filesWithMetadata = await Promise.all(filesData);
                // Após ir buscar todos os ficheiros com as infos que queremos
                // guardamos na variavel 'files' 
                setFiles(filesWithMetadata);
            } catch (error) {
                console.error("Error fetching files:", error);
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

    // Esta função apenas formata a data para uma convencional (dd/mm/yyyy)
    function getDate(date: string) {
        date = date.split('T')[0];
        if (date) {
            const year = date.split('-')[0]
            const month = date.split('-')[1]
            const day = date.split('-')[2]
            return `${day}/${month}/${year}`;
        } else {
            return 'Invalid date format';
        }
    }

    // Aqui estará tudo o que será apresentado na página Home.
    return (
        <div className='w-full h-screen pt-[5rem] px-[8vw] flex flex-col gap-8 text-[var(--blue)]'>
            <img src={IscteLogo} alt="logo" className='w-[15rem]' />
            <h1 className='text-[1.5rem] quatro:text-[2rem] font-bold'>Bem-vindo de volta!</h1>
            <p className='text-black'>Ficheiros:</p>
            <div className='grid grid-cols-1 gap-4 oito:grid-cols-2'>
                {
                    files && files.length !== 0 ? files.map((ele: any, index: number) => {
                        return (
                            <div key={index} onClick={() => navigate(`/file/${ele.name}`)} className='flex justify-between items-center bg-[var(--blue)] rounded-[25px] oito:h-[6rem] w-full text-white p-4 cursor-pointer border-[3px] border-[transparent] hover:border-black quatro:flex-row flex-col gap-4'>
                                <p className='flex flex-col w-full text-left'><span className=''>Nome: </span> {ele?.name}</p>
                                <p className='flex flex-col w-full text-right '><span className=''>Data de upload: </span> {getDate(ele?.lastModifiedDate)}</p>
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

