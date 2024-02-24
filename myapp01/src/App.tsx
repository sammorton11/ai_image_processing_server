import React, { useState } from 'react';
import { PacmanLoader } from 'react-spinners';
import GraphComponent from './components/GraphComponent';
import { Data } from 'victory';
import placeholderImage from './assets/calcium-for-plants.jpg';
import PieChartComponent from './components/PieChart';
import LineChartComponent from './components/LineChart';
import { ThemeProvider } from './components/theme-provider';
import ImageUploader from './components/ImageUploader';
import Header from './components/Header';
import IssueList from './components/IssueList';
import ImageDisplay from './components/ImageDisplay';
import fakeData from './util/fakeData';

interface Data {
   type: string;
   issues: Issue[];
}

interface Issue {
   name: string;
   description: string;
   percent: string;
}


function App() {
   const [data, setData] = useState<Data | null>(fakeData);
   const [input, setInput] = useState("");
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");
   const [file, setFile] = useState<FileList | null>(null);
   const [image, setImage] = useState(placeholderImage);
   const [showGraph, setShowGraph] = useState(true);
   const [isFullScreen, setIsFullScreen] = useState(false);

   const toggleFullScreen = () => {
      setIsFullScreen(!isFullScreen);
   };

   function showHideGraph(e: React.MouseEvent<HTMLButtonElement>) {
      e.preventDefault();
      setShowGraph(!showGraph);
   }

   async function getGeminiResponse(input: string) {
      if (!input || input === "") return;
      setLoading(true);
      setError("");
      setImage(input);

      try {
         const opts = {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               image_url: input
            })
         };
         const response = await fetch('http://127.0.0.1:5001/process_image_url', opts);

         if (response.ok) {
            const responseData = await response.json();
            if (responseData.error) {
               setLoading(false);
               setError(responseData.error);
               return;
            }
            const result = responseData;
            setLoading(false);
            setData(result);
         }

      } catch (error) {
         console.error(error);
         setLoading(false);
      }
   }

   async function sendDataToServer() {
      if (!file) return;
      setError("");
      setLoading(true);

      try {
         const formData = new FormData();
         formData.append('img', file[0]);

         const response = await fetch('http://localhost:5001/process_image_file', {
            method: 'POST',
            body: formData,
         });

         if (response.ok) {
            const result = await response.json();
            setLoading(false);
            setData(result);
         } else {
            setLoading(false);
            setError("Something went wrong - Please try again");
         }
      } catch (error) {
         console.error('Error:', error);
         setLoading(false);
         setError("Something went wrong - Please try again" + error);
      }
   };

   async function handleSubmit(event: React.MouseEvent<HTMLButtonElement>) {
      event.preventDefault();
      if (!file) {
         return;
      }

      const imageObj = URL.createObjectURL(file[0]);
      setImage(imageObj);
      await sendDataToServer();
   };

   const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault();
      const value = event.target.value;
      setInput(value);
      setImage(value);
   };

   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault();
      const value = event.target.files;
      if (value === null) {
         console.log("File not found");
         return;
      }
      const imageObj = URL.createObjectURL(value[0]);
      setFile(value);
      setImage(imageObj);
   };

   return (
      <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
         <div id='main-container' className='min-h-screen dark:bg-neutral-700 dark:text-lime-100/50 flex flex-col w-full'>
            <Header />
            <section className='lg:flex lg:flex-row p-5 text-lime-900 h-full w-full justify-between dark:text-lime-200/50'>
               <section className='flex flex-col lg:pr-5 lg:w-1/2 h-full'>
                  {error ? <p>{error}</p> : null}
                  <ImageUploader 
                     handleInputChange={handleInputChange} 
                     handleFileChange={handleFileChange} 
                     getGeminiResponse={getGeminiResponse}
                     handleSubmit={handleSubmit}
                     input={input}
                  />
                  <ImageDisplay image={image} isFullScreen={isFullScreen} toggleFullScreen={toggleFullScreen} />
                  <PacmanLoader className='w-full' color='#65A30D' loading={loading} />
               </section>
               <IssueList data={data} setData={setData} showHideGraph={showHideGraph} />
            </section>
            {showGraph && data && data.issues && (
               <section className='md:flex flex-row w-full py-10 lg:px-16 justify-between'>
                  <GraphComponent issues={data.issues} />
                  <PieChartComponent issues={data.issues} />
                  <LineChartComponent issues={data.issues} />
               </section>
            )}
         </div>
      </ThemeProvider>
   );
}

export default App;

