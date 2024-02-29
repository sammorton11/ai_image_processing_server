interface ImageDisplayProps {
   image: string;
   isFullScreen: boolean;
   toggleFullScreen: () => void;
}

function ImageDisplay(props: ImageDisplayProps) {
   return (
      <>
         {props.image ?
            <img
               className='my-6 rounded-xl shadow-md max-h-[800px]'
               onClick={props.toggleFullScreen}
               src={props.image}
               alt="issue"
               width="695"
               height="495"
            /> : null
         }

         {props.isFullScreen && (
            <div
               className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 flex justify-center items-center z-50"
               onClick={props.toggleFullScreen}
            >
               <img src={props.image} alt="issue" className="max-w-full max-h-full rounded-xl shadow-md" width="695" height="495" />
            </div>
         )}
      </>
   );
}

export default ImageDisplay;
