import { ModeToggle } from "./mode-toggle";

function Header() {
   return (
      <header className='items-center justify-between flex flex-row dark:bg-neutral-800 bg-lime-200/30 p-5 mx-2 my-3 rounded-md'>
         <section className="flex flex-col">
            <h1 className='sm:text-lg lg:text-3xl font-bold text-lime-900 dark:text-lime-200/60'>Plant Deficiency Detection AI</h1>
            <p className="text-sm py-1">Using Gemini API by Google</p>
         </section>
         <ModeToggle />
      </header>
   );
}

export default Header;
