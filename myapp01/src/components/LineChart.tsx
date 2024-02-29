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

const LineChartComponent: React.FC<GraphProps> = ({ issues }) => {
   const [isFullScreen, setFullScreen] = useState(false);
   const victData = issues.map((issue) => ({
      type: issue.name,
      percentage: parseInt(issue.percent, 10),
   }));

   const regular = 'm-5 rounded-xl dark:bg-neutral-800 bg-lime-100/50 border border-md border-lime-950 shadow-lg';
   const fullScreen = 'fixed top-0 left-0 w-full h-full dark:bg-black/90 flex justify-center items-center z-50';
   const currentStyle = isFullScreen ? fullScreen : regular;

   const handleFullScreen = () => {
      setFullScreen(!isFullScreen);
   };

   return (
      <div id='line-chart' className={currentStyle} onClick={handleFullScreen}>
         <V.VictoryChart 
            polar 
            width={isFullScreen ? window.innerWidth : 500} // Toggle the width depending on the fullscreen state
            height={isFullScreen ? window.innerHeight : 375} // Toggle the height depending on the fullscreen state
            domainPadding={0}
            theme={V.VictoryTheme.material}>
            <V.VictoryArea
               style={{ data: { fill: "#1a2e05" } }}
               data={victData}
               x="type"  
               y="percentage"
            />
            <V.VictoryPolarAxis 
               theme={V.VictoryTheme.material} 
               labelPlacement='vertical'
               style={{ tickLabels: { padding: 25, fontSize: isFullScreen ? 30 : 10}}}
            />
         </V.VictoryChart>
      </div>
   );
};

export default LineChartComponent;

