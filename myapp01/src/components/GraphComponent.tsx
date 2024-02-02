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

const GraphComponent: React.FC<GraphProps> = ({ issues, type }) => {
   const percentage_array = issues.map(issue => parseInt(issue.percent, 10));
   const labels = issues.map(issue => issue.name);
   console.log(type);


   const victData = issues.map((issue) => ({
      type: issue.name, percentage: parseInt(issue.percent, 10)
   }));

   console.log("Victory Data: ", victData);

   const data = {
      labels: labels,
      datasets: [
         {
            data: percentage_array,
            backgroundColor: [
               'rgba(255, 99, 132, 0.6)',
               'rgba(255, 205, 86, 0.6)',
               'rgba(75, 192, 192, 0.6)',
               'rgba(54, 162, 235, 0.6)',
            ],
         },
      ],
   };

   console.log("Labels: ", data.labels);
   console.log("Data: ", data.datasets[0].data);

   return (
      <div className='w-3/4 max-w-2xl'>
         <V.VictoryChart 
            theme={V.VictoryTheme.material}
            domainPadding={12}
            minDomain={{x: 0}}
         >
            <V.VictoryAxis dependentAxis tickFormat={(x) => (`${x}%`)} />
            <V.VictoryAxis style={{ tickLabels: { angle: 18, fontSize: 8, padding: 8} }}/> 
            <V.VictoryBar
               data={victData}
               x="type"
               y="percentage"
            />
         </V.VictoryChart>
      </div>
   );
};

export default GraphComponent;

