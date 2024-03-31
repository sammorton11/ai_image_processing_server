// hooks/useFullScreenToggle.ts
import { useState } from 'react';

const useFullScreenToggle = () => {
    const [isFullScreen, setIsFullScreen] = useState(false);

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    return { isFullScreen, toggleFullScreen };
};

export default useFullScreenToggle;
