// hooks/useGraphSelection.ts
import { useState, useMemo } from 'react';

const useGraphSelection = () => {
    const [currentGraph, setCurrentGraph] = useState('Bar');
    const graphButtons = useMemo(() => ['Bar', 'Radar', 'Polar Area', 'Line', 'Doughnut'], []);

    const mappedGraphButtons = useMemo(() => graphButtons.map((button) => ({
        name: button,
        onClick: () => setCurrentGraph(button),
    })), [graphButtons]);

    return { currentGraph, mappedGraphButtons };
};

export default useGraphSelection;
