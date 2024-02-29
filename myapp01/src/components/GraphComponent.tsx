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

const GraphComponent: React.FC<GraphProps> = ({ issues }) => {
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
      <div id='bar-graph' className={current} onClick={handleFullScreen}>
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

