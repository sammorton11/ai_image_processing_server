import React, { useState } from 'react';
import { Data } from '../types/types.ts'; // Adjust the path as necessary

interface UseImageProcessingParams {
   setData: React.Dispatch<React.SetStateAction<Data | null>>;
}

export const useImageProcessing = ({ setData }: UseImageProcessingParams) => {
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');

   const processImage = async (imageUrl: string) => {
      if (!imageUrl) {
         alert('Please enter a valid URL');
         return;
      }
      setLoading(true);
      setError('');
      try {
         const response = await fetch('https://plant-ai-go-server-709f8279358b.herokuapp.com/process_image_url', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image_url: imageUrl }),
         });
         if (response.ok) {
            const result: Data = await response.json();
            setData(result);
         } else {
            setError(`${response.status} - Error sending image to Gemini`)
         }
      } catch (err) {
         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
         // @ts-expect-error
         setError(err.message);
      } finally {
         setLoading(false);
      }
   };

   const processImageFile = async (file: File) => {
      if (!file) {
         alert('Please upload a valid file');
         return;
      }
      setLoading(true);
      setError('');
      try {
         const formData = new FormData();
         formData.append('img', file);

         const response = await fetch('https://plant-ai-go-server-709f8279358b.herokuapp.com/process_image_file', {
            method: 'POST',
            body: formData,
         });

         if (response.ok) {
            const result: Data = await response.json();
            setData(result);
         } else {
            setError(`${response.status} - Error sending image to Gemini`)
         }
      } catch (err) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
         // @ts-expect-error
          setError(err.message);
      } finally {
         setLoading(false);
      }
   };

   return { loading, error, processImage, processImageFile };
};
