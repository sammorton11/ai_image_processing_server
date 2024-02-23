import React, { useState } from 'react';
import * as V from 'victory';

interface Issue {
   name: string;
   description: string;
   percent: string;
}

interface GraphProps {
   issues: Issue[];
}

const PieChartComponent: React.FC<GraphProps> = ({ issues }) => {
   const [isFullScreen, setFullScreen] = useState(false);
   const victData = issues.map((issue) => ({
      type: issue.name, percentage: parseInt(issue.percent, 10)
   }));

   const regular = 'm-5 rounded-xl dark:bg-neutral-800 bg-lime-100/50 border border-md border-lime-950 shadow-lg';
   const fullScreen = 'fixed top-0 left-0 w-full h-full dark:bg-black/90 flex justify-center items-center z-50';
   const current = isFullScreen ? fullScreen : regular;

   const handleFullScreen = () => {
      setFullScreen(!isFullScreen);
   };

   return (
      <div id='pie-chart' className={current} onClick={handleFullScreen}>
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

