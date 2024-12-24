import { useState } from 'react';
import { Button } from './ui/button';
import { IssueListProps } from '../types/types.ts';

function IssueList({ data, setData, mappedGraphButtons }: IssueListProps) {
   const [selectedButton, setSelectedButton] = useState<string>('');
   if (!data) return null;

   const handleGraphButtonClick = (name: string) => {
      setSelectedButton(name);

      const button = mappedGraphButtons?.find(b => b.name === name);
      if (button && button.onClick) {
         button.onClick(name);
      }
   } 

   return (
      <div className='p-4 sm:w-full lg:w-3/4 bg-lime-100 dark:bg-neutral-800 dark:text-lime-100/50 rounded-md lg:max-w-7xl shadow-lg align-top'>
         <div className='flex flex-row w-full justify-between'>
            {data.subject_type && (
               <h3 className='dark:text-lime-100/60 text-lime-900 sm:text-xl md:text-2xl lg:text-3xl font-bold pb-4'>
                  {data.subject_type}
               </h3>
            )}
            <Button className='bg-red-200 text-slate-900 mx-2' onClick={() => setData(null)}>Clear</Button>
         </div>
         <ul>
            {data.issues.map((item, index) => (
               <li className='pb-10' key={index}>
                  <div className='font-bold md:text-md lg:text-xl'>{item.name}</div>
                  <div className='lg:text-md'>{item.description}</div>
                  <br />
                  <div className='lg:text-sm'>Probability: {item.probability}</div>
               </li>
            ))}
            {mappedGraphButtons && (
               <div className='flex lg:flex-row justify-center pt-8'>
                  {mappedGraphButtons.map((button) => {
                     return (
                        <button
                           key={button.name} // It's good practice to provide a unique key for each item in a list
                           className={`text-[9px] lg:text-sm w-[100px] m-2 border rounded-md lg:p-[6px] ${selectedButton === button.name ? 'bg-lime-300 text-black border-lime-500' : 'text-neutral-500 border-neutral-500'
                              }`}
                           onClick={() => handleGraphButtonClick(button.name)}>{button.name}</button>
                     );
                  })}
               </div>
            )}
         </ul>
      </div>
   );
}

export default IssueList;
