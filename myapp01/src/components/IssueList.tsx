import React from 'react';
import { Button } from './ui/button';

interface Issue {
   name: string;
   description: string;
   percent: string;
}

interface Data {
   type: string;
   issues: Issue[];
}

interface IssueListProps {
   data: Data | null;
   setData: React.Dispatch<React.SetStateAction<Data | null>>;
   showHideGraph: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

function IssueList({ data, setData, showHideGraph }: IssueListProps) {
   if (!data) return null;

   return (
      <div className='p-4 sm:w-full lg:w-3/4 bg-lime-100 dark:bg-neutral-800 dark:text-lime-100/50 rounded-md lg:max-w-7xl border border-md border-lime-950 shadow-lg align-top'>
         <div className='flex flex-row w-full justify-between'>
            {data.type && <div className='dark:text-lime-100/60 text-lime-900 sm:text-xl md:text-2xl lg:text-3xl font-bold pb-4'>{data.type}</div>}
            <Button className='bg-red-200 text-slate-900 mx-2' onClick={() => setData(null)}>Clear</Button>
         </div>
         <ul>
            {data.issues.map((item, index) => (
               <li className='pb-10' key={index}>
                  <div className='font-bold md:text-md lg:text-xl'>{item.name}</div>
                  <div className='lg:text-md'>{item.description}</div>
                  <br />
                  <div className='lg:text-sm'>Probability: {item.percent}</div>
               </li>
            ))}
            <Button className='bg-lime-300 text-slate-900 mt-5 sm:text-sm lg:text-md' onClick={showHideGraph}>Graph</Button>
         </ul>
      </div>
   );
}

export default IssueList;
