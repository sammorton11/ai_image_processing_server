import { Button } from './ui/button';
import { IssueListProps } from '../types/types.ts';

function IssueList({ data, setData, mappedGraphButtons }: IssueListProps) {
   if (!data) return null;

   return (
      <div className='p-4 sm:w-full lg:w-3/4 bg-lime-100 dark:bg-neutral-800 dark:text-lime-100/50 rounded-md lg:max-w-7xl shadow-lg align-top'>
         <div className='flex flex-row w-full justify-between'>
            {data.type && (
               <h3 className='dark:text-lime-100/60 text-lime-900 sm:text-xl md:text-2xl lg:text-3xl font-bold pb-4'>
                  {data.type}
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
                  <div className='lg:text-sm'>Probability: {item.percent}</div>
               </li>
            ))}
            {mappedGraphButtons && (
               <div className='flex flex-row justify-around pt-8'>
                  {mappedGraphButtons.map((button) => {
                     return (
                        <Button 
                           key={button.name}
                           className='bg-lime-200/80 sm:w-[60px] lg:w-[100px]'
                           onClick={() => button.onClick(button.name)}>
                              {button.name}
                        </Button>
                     );
                  })}
               </div>
            )}
         </ul>
      </div>
   );
}

export default IssueList;
