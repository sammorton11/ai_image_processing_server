function Footer() {
    return (
        <footer className='pt-24 pb-10 pl-5 dark:text-lime-200/50'>
            <div className="flex flex-col justify-start">
                <p>
                    Source code on
                    <a className="text-lime-400"
                       href='https://github.com/sammorton11/ai_image_processing_server'
                       target='_blank'
                       rel='noreferrer'
                    >
                        GitHub
                    </a>
                </p>
                <p>&copy; 2024 Google Gemini</p>
            </div>
        </footer>
    )
}

export default Footer;