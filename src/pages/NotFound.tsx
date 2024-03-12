import React from 'react';

export default function NotFound() {
    return (
        <div className='w-full h-screen justify-center items-center flex flex-col gap-4 text-[var(--blue)]'>
            <h1 className='text-[2rem] font-bold'>Erro 404</h1>
            <p>Esta página não existe</p>
        </div>
    );
}

