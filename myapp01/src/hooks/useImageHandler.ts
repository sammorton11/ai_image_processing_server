// hooks/useImageHandler.ts
import { useState, useCallback } from 'react';
import placeholderImage from '../assets/calcium-for-plants.jpg';

const useImageHandler = () => {
    const [input, setInput] = useState("");
    const [file, setFile] = useState<FileList | null>(null);
    const [image, setImage] = useState(placeholderImage);

    const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        const value = event.target.value;
        setInput(value);
        setImage(value);
    }, [setInput, setImage]);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        const value = event.target.files;
        if (value === null) {
            console.log("File not found");
            return;
        }
        const imageObj = URL.createObjectURL(value[0]);
        setFile(value);
        setImage(imageObj);
    }, [setFile, setImage]);

    return { input, setInput, file, setFile, image, setImage, handleInputChange, handleFileChange };
};

export default useImageHandler;
