import React from 'react';
import * as V from 'victory';

interface Issue {
   name: string;
   description: string;
   percent: string;
}

interface GraphProps {
   issues: Issue[];
   type: string;
}

const PieChartComponent: React.FC<GraphProps> = ({ issues }) => {

   const victData = issues.map((issue) => ({
      type: issue.name, percentage: parseInt(issue.percent, 10)
   }));

   console.log("Victory Data: ", victData);

   return (
      <div className='m-5 rounded-xl bg-lime-100/50 border border-md border-lime-950 shadow-lg'>
         <V.VictoryPie
            theme={V.VictoryTheme.material}            
            width={500}
            data={victData}
            style={{ labels: { fontSize: 10 }, data: { } }}
            colorScale={["#1a2e05", "#4d7c0f", "#d9f99d", "#a3e635"]}
            x="type"
            y="percentage"
         />
      </div>
   );
};

export default PieChartComponent;

