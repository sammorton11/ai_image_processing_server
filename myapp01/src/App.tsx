// App.tsx
import { useState } from 'react';
import { PacmanLoader } from 'react-spinners';
import { ThemeProvider } from './components/theme-provider';
import ImageUploader from './components/ImageUploader';
import Header from './components/Header';
import IssueList from './components/IssueList';
import ImageDisplay from './components/ImageDisplay';
import { useImageProcessing } from "@/hooks/useImageProcessing.ts";
import {Data} from "@/types/types.ts";
import Footer from "@/components/Footer.tsx";
import Graphs from "@/components/Graphs.tsx";
import useFullScreenToggle from "@/hooks/useFullScreenToggle.ts";
import useGraphSelection from "@/hooks/useGraphSelection.ts";
import useImageHandler from "@/hooks/useImageHandler.ts"; // Adjust the path as necessary
import fakeData from './util/fakeData';

function App() {
   const [data, setData] = useState<Data | null>(fakeData)
   const { loading, error, processImage, processImageFile } = useImageProcessing({ setData });
   const { isFullScreen, toggleFullScreen } = useFullScreenToggle();
   const { currentGraph, mappedGraphButtons } = useGraphSelection();
   const { input, file, image, handleInputChange, handleFileChange } = useImageHandler();

   return (
       <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
          <div id='main-container' className='min-h-screen dark:bg-neutral-900 dark:text-lime-100/50 flex flex-col w-full'>
             <Header />
             <section className='lg:flex lg:flex-row p-5 text-lime-900 h-full w-full justify-between dark:text-lime-200/50'>
                <section className='flex flex-col lg:pr-5 lg:w-1/2 h-full'>
                   {error && <p>{error}</p>}
                   <ImageUploader
                       file={file}
                       input={input}
                       handleInputChange={handleInputChange}
                       processImage={processImage}
                       handleFileChange={handleFileChange}
                       processImageFile={processImageFile}
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
             <Graphs
                 data={data}
                 currentGraph={currentGraph}
             />
             <Footer/>
          </div>
       </ThemeProvider>
   );
}

export default App;
