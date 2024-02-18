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
      <div className='m-5 rounded-xl dark:bg-neutral-800 bg-lime-100/50 border border-md border-lime-950 shadow-lg'>
         <V.VictoryChart 
            width={500}
            theme={V.VictoryTheme.material}
            style={{
               background: { fill: "#ecfccb"}
            }}
            minDomain={{x: 0, y: 1}}
            domainPadding={30}
         >
            <V.VictoryAxis dependentAxis tickFormat={(x) => (`${x}%`)} />
            <V.VictoryAxis style={{ tickLabels: { angle: 13, fontSize: 7, padding: 14} }}/> 
            <V.VictoryBar
               data={victData}
               style={{
                  parent: {
                     border: "4px solid #000"
                  },
                  data: { fill: "#1a2e05" }
               }}
               x="type"
               y="percentage"
            />
         </V.VictoryChart>
      </div>
   );
};

export default GraphComponent;

