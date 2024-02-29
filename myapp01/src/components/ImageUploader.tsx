import React from 'react';
import { Button } from './ui/button';

interface ImageUploaderProps {
   handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
   handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
   getGeminiResponse: (input: string) => void;
   handleSubmit: (event: React.MouseEvent<HTMLButtonElement>) => void;
   input: string;
}

function ImageUploader(props: ImageUploaderProps): JSX.Element {
   return (
      <div>
         <label className='mr-2 mb-1 dark:text-lime-100/50 text-lime-900 font-bold'>Image URL:</label>
         <input
            className='border border-1 border-lime-900/40 p-2 lg:w-3/4 dark:bg-lime-200/10 light:bg-lime-900/10 rounded-sm lg:mr-10 text-black'
            onChange={props.handleInputChange}
            placeholder='https://vsesorta.ru/upload/iblock/bdc/737923i-khosta-gibridnaya-hands-up.jpg'
         />
         <div className='py-5'>
            <input id='upload' type="file" onChange={props.handleFileChange} />
         </div>
         <section className='flex flex-row w-full justify-start'>
            <Button
               className='dark:bg-neutral-800 bg-lime-100 dark:text-lime-100 text-slate-900'
               onClick={() => props.getGeminiResponse(props.input)}
            >
               Submit URL
            </Button>
            <div className='px-1' />
            <Button
               className='dark:bg-neutral-800 bg-lime-100 dark:text-lime-100 text-slate-900'
               onClick={(event) => props.handleSubmit(event)}
            >
               Submit File
            </Button>
         </section>
      </div>
   );
}

export default ImageUploader;
