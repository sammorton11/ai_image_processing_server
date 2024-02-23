import React, { useState } from 'react';
import { Button } from './components/ui/button';
import { PacmanLoader } from 'react-spinners';
import GraphComponent from './components/GraphComponent';
import { Data } from 'victory';
import placeholderImage from './assets/calcium-for-plants.jpg';
import PieChartComponent from './components/PieChart';
import LineChartComponent from './components/LineChart';
import { ThemeProvider } from './components/theme-provider';
import { ModeToggle } from './components/mode-toggle';

interface Data {
   type: string;
   issues: Issue[];
}

interface Issue {
   name: string;
   description: string;
   percent: string;
}

const fakeData = {
   "issues": [
      {
         "description": "Symptoms include reddish-blue spots on the leaves, with dark purple spots on the canes. The spots may grow in size and merge, leading to yellowing of the leaves and premature shedding. Anthracnose can also result in cracking and cankers on the canes. To combat anthracnose, it is recommended to prune and eliminate infected canes, and apply a suitable fungicide to the plants.",
         "name": "Anthracnose",
         "percent": "100.0"
      },
      {
         "description": "The tomato plant leaves have developed black spots, a prevalent issue attributable to a bacterial infection. The likeliest culprit is bacterial spot, caused by the bacterium Xanthomonas vesicatoria. Bacterial spot can manifest as black spots on leaves, stems, and fruit. Addressing this involves employing a copper-based bactericide or removing and destroying infected plant material.",
         "name": "Bacterial Spot",
         "percent": "75.0"
      },
      {
         "description": "The tomato plant leaves have developed brown spots, a prevalent issue attributable to a fungal infection. The likeliest culprit is Septoria leaf spot, caused by the fungus Septoria lycopersici. Septoria leaf spot can manifest as brown spots on leaves, which can eventually lead to defoliation. Addressing this involves employing a fungicide or removing and destroying infected plant material.",
         "name": "Septoria Leaf Spot",
         "percent": "25.0"
      }
   ],
   "type": "Gooseberry"
}


function App() {
   const [data, setData] = useState<Data | null>(fakeData);
   const [input, setInput] = useState("");
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");
   const [file, setFile] = useState<FileList | null>(null);
   const [image, setImage] = useState(placeholderImage);
   const [showGraph, setShowGraph] = useState(true);
   // State to manage full screen mode
   const [isFullScreen, setIsFullScreen] = useState(false);

   // Function to toggle full screen mode
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
      console.log("value", value);
      const imageObj = URL.createObjectURL(value[0]);
      console.log(imageObj);
      setFile(value);
      setImage(imageObj);
   };

   return (
      <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
         <div className='min-h-screen dark:bg-neutral-700 dark:text-lime-100/50 flex flex-col w-full'>
            <header className='items-center justify-between flex flex-row dark:bg-neutral-800 bg-lime-200/30 p-5 mx-2 my-3 rounded-md'>
               <section className="flex flex-col">
                  <h1 className='sm:text-lg lg:text-3xl font-bold text-lime-900 dark:text-lime-200/60'>Plant Deficiency Detection AI</h1>
                  <p className="text-sm py-1">Using Gemini API by Google</p>
               </section>
               <ModeToggle />
            </header>
            <div className='lg:flex lg:flex-row p-5 text-lime-900 h-full w-full justify-between dark:text-lime-200/50'>
               <div className='flex flex-col lg:pr-5 lg:w-1/2 h-full'>
                  {error ? <p>{error}</p> : null}
                  <label className='ml-2 mb-1 dark:text-lime-100/50 text-lime-900 font-bold'>Image URL:</label>
                  <input 
                     className='border border-1 border-lime-900/40 p-2 lg:w-3/4 dark:bg-lime-200/10 light:bg-lime-900/10 rounded-sm lg:mr-10 text-black' 
                     onChange={handleInputChange} 
                     placeholder='https://vsesorta.ru/upload/iblock/bdc/737923i-khosta-gibridnaya-hands-up.jpg' 
                  />
                  <div className='py-5'>
                     <input id='upload' type="file" onChange={handleFileChange} />
                  </div>
                  <section className='flex flex-row w-full justify-start'>
                     <Button 
                        className='dark:bg-neutral-800 bg-lime-100 dark:text-lime-100 text-slate-900' 
                        onClick={() => getGeminiResponse(input)}>Submit URL
                     </Button>
                     <div className='px-1' />
                     <Button 
                        className='dark:bg-neutral-800 bg-lime-100 dark:text-lime-100 text-slate-900' 
                        onClick={(event) => handleSubmit(event)}>Submit File
                     </Button>
                  </section>
                  {image ?
                     <img 
                        className='my-6 rounded-xl shadow-md max-h-[800px]' 
                        onClick={toggleFullScreen} 
                        src={image} 
                        alt="issue" 
                        width="695" 
                        height="495" 
                     /> : null
                  }

                  {isFullScreen && (
                     <div
                        className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 flex justify-center items-center z-50"
                        onClick={toggleFullScreen} // Close full screen on click
                     >
                        <img src={image} alt="issue" className="max-w-full max-h-full rounded-xl shadow-md" width="695" height="495" />
                     </div>
                  )}

                  <PacmanLoader className='w-full' color='#65A30D' loading={loading} />
               </div>

               {data ? (
                  <div className='p-4 sm:w-full lg:w-3/4 bg-lime-100 dark:bg-neutral-800 dark:text-lime-100/50 rounded-md lg:max-w-7xl border border-md border-lime-950 shadow-lg align-top' >
                     <div className='flex flex-row w-full justify-between'>
                        {data && data.type ? <div className='dark:text-lime-100/60 text-lime-900 sm:text-xl md:text-2xl lg:text-3xl font-bold pb-4'>{data.type}</div> : null}
                        <Button className='bg-red-200 text-slate-900 mx-2' onClick={() => setData(null)}>Clear</Button>
                     </div>
                     <ul>
                        {data && data.issues.map((item) => (
                           <li className='pb-10' key={item.name}>
                              <div className='font-bold md:text-md lg:text-xl'>{item.name}</div>
                              <div className='lg:text-md'>{item.description}</div>
                              <br />
                              <div className='lg:text-sm'>Probability: {item.percent}</div>
                           </li>
                        ))}
                        {data ? (
                           <Button className='bg-lime-300 text-slate-900 mt-5 sm:text-sm lg:text-md' onClick={(event) => showHideGraph(event)}>Graph</Button>
                        ) : null}
                     </ul>
                  </div>
               ) : null}
            </div>
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

