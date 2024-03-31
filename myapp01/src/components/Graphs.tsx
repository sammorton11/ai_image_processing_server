import BarGraph from "@/components/BarGraph.tsx";
import PolarAreaChart from "@/components/PolarAreaChart.tsx";
import RadarChart from "@/components/RadarChart.tsx";
import LineGraph from "@/components/LineGraph.tsx";
import DoughnutChart from "@/components/DoughnutChart.tsx";
import {Data} from "@/types/types.ts";
import {useMemo} from "react";

interface GraphsProps {
    data: Data | null,
    currentGraph: string
}

function Graphs({data, currentGraph}: GraphsProps) {
    const keyIssueList = useMemo(() => {
        return data ? data.issues.map((issue) => issue.name) : [];
    }, [data]);
    return (
        <section className="flex flex-row w-full justify-center p-5">
            <div className="px-10">
                {keyIssueList.map((issue) => (
                    <div key={issue} className="p-2">{issue}</div>
                ))}
            </div>
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
