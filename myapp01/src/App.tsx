import { useState } from 'react';
import { Button } from './components/ui/button';
import { PacmanLoader } from 'react-spinners';
import GraphComponent from './components/GraphComponent';
import { Data } from 'victory';
import  placeholderImage from './assets/calcium-for-plants.jpg';
import PieChartComponent from './components/PieChart';
import LineChartComponent from './components/LineChart';

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
      "description": "Fake Issue 2 Description",
      "name": "Fake Issue 2",
      "percent": "25.0"
    },
    {
      "description": "Fake Issue 3 Description",
      "name": "Fake Issue 3",
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
   const [showGraph, setShowGraph] = useState(false);

   function showHideGraph(e: React.MouseEvent<HTMLButtonElement>) {
      e.preventDefault();
      setShowGraph(!showGraph);
   }

   async function getGeminiResponse(input: string) {
      setLoading(true);
      setShowGraph(false);
      setError("");
      setImage(input);
      setData(null);

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
         const response = await fetch('http://127.0.0.1:5000/process_image_url', opts);

         if (!response.ok) {
            throw new Error("Something went wrong");
         }

         const responseData = await response.json();
         if (responseData.error) {
            setLoading(false);
            setError(responseData.error);
            return;
         }

         const result = responseData;
         console.log("Result: ", result);
         setLoading(false);
         setData(result);

         console.log("Data that is set: ", data);
      } catch (error) {
         console.error(error);
         setLoading(false);
      }
   }

   const sendDataToServer = async () => {
      setError("");
      setData(null);
      setLoading(true);
      if (!file) return;

      try {
         const formData = new FormData();
         formData.append('img', file[0]);

         console.log("FORM DATA: ", formData);
         const response = await fetch('http://127.0.0.1:5000/process_image_file', {
            method: 'POST',
            body: formData,
         });

         if (response.ok) {
            const result = await response.json();
            console.log(result);
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

   const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      if (!file) {
         return;
      }

      const imageObj = URL.createObjectURL(file[0]);

      setImage(imageObj);
      console.log("File: ", imageObj);

      sendDataToServer();
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
      console.log("File: ", value);
      setFile(value);
      setImage(URL.createObjectURL(value[0]));
   };

   return (
      <>
         <header className='bg-lime-200/30 p-5 m-2 rounded-md'>
            <h1 className='text-3xl font-bold text-lime-900'>Plant Deficiency Detection AI</h1>
            <p className="py-3">Using Gemini API by Google</p>
         </header>
         <div className='flex flex-row p-5 text-lime-900 h-full'>
            <div className='pr-6 w-1/2'>
               {error ? <p>{error}</p> : null}
               <label className='mr-5 text-lime-900 font-bold'>Image URL:</label>
               <input className='border border-1 border-lime-900/40 p-2 w-3/4 bg-lime-900/10 rounded-sm mr-10 text-black' onChange={handleInputChange} placeholder='https://vsesorta.ru/upload/iblock/bdc/737923i-khosta-gibridnaya-hands-up.jpg' />
               <div className='py-5'>
                  <input type="file" onChange={handleFileChange} />
               </div>
               <section className='flex flex-row w-full justify-start'>
                  <Button className='bg-lime-100 text-slate-900' onClick={() => getGeminiResponse(input)}>Submit URL</Button>
                  <div className='px-1' />
                  <Button className='bg-lime-100 text-slate-900' onClick={(event) => handleSubmit(event)}>Submit File</Button>
               </section>

               {image ? <img className='my-6 rounded-xl shadow-md' src={image} alt="issue" width="750" height="550" /> : null}

               <PacmanLoader className='w-full' color='#65A30D' loading={loading} />
            </div>

            {data ? (

               <div className='p-4 mr-14 w-3/4 bg-lime-100 rounded-md max-w-7xl border border-md border-lime-950 shadow-lg' >
                  <div className='flex flex-row w-full justify-between'>
                     {data && data.type ? <div className='text-lime-950 text-3xl font-bold pb-4'>Plant Type: {data.type}</div> : null}
                     <Button className='bg-red-200 text-slate-900 mx-2' onClick={() => setData(null)}>Clear</Button>
                  </div>
                  <ul>
                     {data && data.issues.map((item) => (
                        <li className='pb-5' key={item.name}>
                           <div className='font-bold text-lg'>{item.name}</div>
                           <div>{item.description}</div>
                           <br />
                           <div>Probability: {item.percent}</div>
                        </li>
                     ))}
                     {data ? (
                        <Button className='bg-lime-300 text-slate-900 mt-5' onClick={(event) => showHideGraph(event)}>Show Graph</Button>
                     ) : null}
                  </ul>
               </div>
            ) : null}
         </div>
         {showGraph && data && data.issues && (
            <div className='flex flex-row w-full py-10'>
               <GraphComponent issues={data.issues} type={data.type} />
               <PieChartComponent issues={data.issues} type={data.type}/>
               <LineChartComponent issues={data.issues} type={data.type} />
            </div>
         )}
      </>
   );
}

export default App;

