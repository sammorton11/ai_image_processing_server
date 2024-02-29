import React, { useState, useMemo, useCallback } from 'react';
import { PacmanLoader } from 'react-spinners';
import { Data } from 'victory';
import placeholderImage from './assets/calcium-for-plants.jpg';
import { ThemeProvider } from './components/theme-provider';
import ImageUploader from './components/ImageUploader';
import Header from './components/Header';
import IssueList from './components/IssueList';
import ImageDisplay from './components/ImageDisplay';
import fakeData from './util/fakeData';
import BarGraph from './components/BarGraph';
import PolarAreaChart from './components/PolarAreaChart';
import RadarChart from './components/RadarChart';
import LineGraph from './components/LineGraph';
import DoughnutChart from './components/DoughnutChart';

interface GraphButton {
   name: string;
   onClick: (name: string) => void;
}

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
   const [isFullScreen, setIsFullScreen] = useState(false);

   const [currentGraph, setCurrentGraph] = useState('Bar');
   const graphButtons = ['Bar', 'Radar', 'Polar Area', 'Line', 'Doughnut'];

   const keyIssueList = useMemo(() => {
      return data ? data.issues.map((issue) => issue.name) : [];
   }, [data]);

   const mappedGraphButtons: GraphButton[] = useMemo(() => graphButtons.map((button) => {
      return {
         name: button,
         onClick: () => {
            setCurrentGraph(button);
            graphSwitcher(button);
         }
      };
   }), [graphButtons]);

   function graphSwitcher(graphType: string) {
      switch (graphType) {
         case 'Bar':
            setCurrentGraph('Bar');
            break;
         case 'Radar':
            setCurrentGraph('Radar');
            break;
         case 'Pie':
            setCurrentGraph('Pie');
            break;
         case 'Line':
            setCurrentGraph('Line');
            break;
         case 'Doughnut':
            break;
      }
   }

   const toggleFullScreen = () => {
      setIsFullScreen(!isFullScreen);
   };

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

   const handleSubmit = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      if (!file) {
         return;
      }
      const imageObj = URL.createObjectURL(file[0]);
      setImage(imageObj);
      sendDataToServer();
   }, [file, sendDataToServer]); // Add all dependencies here

   const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault();
      const value = event.target.value;
      setInput(value);
      setImage(value);
   }, [setInput, setImage]);

   const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault();
      const value = event.target.files;
      if (value === null) {
         console.log("File not found");
         return;
      }
      const imageObj = URL.createObjectURL(value[0]);
      setFile(value);
      setImage(imageObj);
   }, [setFile, setImage]);

   return (
      <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
         <div id='main-container' className='min-h-screen dark:bg-neutral-900 dark:text-lime-100/50 flex flex-col w-full'>
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
                  <ImageDisplay 
                     image={image} 
                     isFullScreen={isFullScreen} 
                     toggleFullScreen={toggleFullScreen} 
                  />
                  <PacmanLoader 
                     className='w-full' 
                     color='#65A30D' 
                     loading={loading} 
                  />
               </section>
               <IssueList 
                  data={data} 
                  setData={setData} 
                  mappedGraphButtons={mappedGraphButtons} 
               />
            </section>
            {data && data.issues && (
               <section className="flex flex-row w-full justify-center p-5">
                  <div className="px-10">
                     {keyIssueList.map((issue) => (
                        <div key={issue} className="p-2">{issue}</div>
                     ))}
                  </div>
                  {currentGraph === 'Bar' && (
                     <BarGraph 
                        labelData={data.issues.map((issue) => issue.name)} 
                        percentData={data.issues.map((issue) => issue.percent)} 
                     />
                  )}
                  {currentGraph === 'Polar Area' && (
                     <PolarAreaChart 
                        labelData={data.issues.map((issue) => issue.name)} 
                        percentData={data.issues.map((issue) => issue.percent)} 
                     />
                  )}
                  {currentGraph === 'Radar' && (
                     <RadarChart 
                        labels={data.issues.map((issue) => issue.name)} 
                        data={data.issues.map((issue) => parseInt(issue.percent, 10))} 
                     />
                  )}
                  {currentGraph === 'Line' && (
                     <LineGraph 
                        labels={data.issues.map((issue) => issue.name)} 
                        data={data.issues.map((issue) => parseInt(issue.percent, 10))} 
                     />
                  )}
                  {currentGraph === 'Doughnut' && (
                     <DoughnutChart 
                        labels={data.issues.map((issue) => issue.name)} 
                        data={data.issues.map((issue) => parseInt(issue.percent, 10))} 
                     />
                  )}
               </section>
            )}
            <footer className='pt-24 pb-10 pl-5  dark:text-lime-200/50'>
               <div className="flex flex-col justify-start">
                  <p>Source code on <a className="text-lime-400" href='https://github.com/sammorton11/ai_image_processing_server' target='_blank' rel='noreferrer'>GitHub</a></p>
                  <p>&copy; 2024 Google Gemini</p>
               </div>

            </footer>
         </div>
      </ThemeProvider>
   );
}

export default App;

