import BarGraph from "@/components/BarGraph.tsx";
import PolarAreaChart from "@/components/PolarAreaChart.tsx";
import RadarChart from "@/components/RadarChart.tsx";
import LineGraph from "@/components/LineGraph.tsx";
import DoughnutChart from "@/components/DoughnutChart.tsx";
import {GraphProps} from "@/types/types.ts";


function Graphs({data, currentGraph}: GraphProps) {
    return (
        <section className="flex w-full justify-center p-5">
            {data && (
                <>
                    {currentGraph === 'Bar' && (
                        <BarGraph
                            labelData={data.issues.map((issue) => issue.name)}
                            percentData={data.issues.map((issue) => issue.percent)}
                        />
                    )}
                    {currentGraph === 'Polar Area' && (
                        <PolarAreaChart
                            labelData={data.issues.map((issue) => issue.name)}
                            percentData={data.issues.map((issue) => issue.percent)}
                        />
                    )}
                    {currentGraph === 'Radar' && (
                        <RadarChart
                            labels={data.issues.map((issue) => issue.name)}
                            data={data.issues.map((issue) => parseInt(issue.percent, 10))}
                        />
                    )}
                    {currentGraph === 'Line' && (
                        <LineGraph
                            labels={data.issues.map((issue) => issue.name)}
                            data={data.issues.map((issue) => parseInt(issue.percent, 10))}
                        />
                    )}
                    {currentGraph === 'Doughnut' && (
                        <DoughnutChart
                            labels={data.issues.map((issue) => issue.name)}
                            data={data.issues.map((issue) => parseInt(issue.percent, 10))}
                        />
                    )}
                </>
            )}
        </section>
    );
}

export default Graphs;
