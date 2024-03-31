import React, { useCallback } from 'react';
import { Button } from './ui/button';

interface ImageUploaderProps {
   handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
   handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
   processImage: (input: string) => void;
   processImageFile: (file: File) => Promise<void>;
   input: string;
   file: FileList | null;
}

function ImageUploader(props: ImageUploaderProps): JSX.Element {
   const handleSubmitFile = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      if (props.file && props.file.length > 0) {
         props.processImageFile(props.file[0]);
      }
   }, [props]);

   const handleSubmitUrl = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      props.processImage(props.input);
   }, [props]);

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
               onClick={(event) => handleSubmitUrl(event)}
            >
               Submit URL
            </Button>
            <div className='px-1' />
            <Button
               className='dark:bg-neutral-800 bg-lime-100 dark:text-lime-100 text-slate-900'
               onClick={(event) => handleSubmitFile(event)}
            >
               Submit File
            </Button>
         </section>
      </div>
   );
}

export default ImageUploader;
