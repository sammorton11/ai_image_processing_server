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

const LineChartComponent: React.FC<GraphProps> = ({ issues }) => {
   const victData = issues.map((issue) => ({
      type: issue.name,
      percentage: parseInt(issue.percent, 10),
   }));

   return (
      <div className='m-5 rounded-xl dark:bg-neutral-800 bg-lime-100/50 border border-md border-lime-950 shadow-lg'>
         <V.VictoryChart 
            polar 
            width={500}
            domainPadding={0}
            theme={V.VictoryTheme.material}>
            <V.VictoryArea
               style={{ labels: { fontSize: 10 }, data: { fill: "#1a2e05" } }}
               data={victData}
               x="type"  // Make sure to specify the x-axis data
               y="percentage"  // Specify the y-axis data
            />
            <V.VictoryPolarAxis 
               theme={V.VictoryTheme.material} 
               labelPlacement='vertical'
               style={{ tickLabels: { padding: 25 }}}
            />
         </V.VictoryChart>
      </div>
   );
};

export default LineChartComponent;

