const dashboardContent = [
  {
    title: 'Try sample app',
    description: 'Try sample application.TODO management application is provided as a sample.',
    href: 'https://devdoc.hexabase.com/docs/introduction/demo',
  },
  {
    title: 'Add database',
    description: 'Create database for your application using a template.',
    href: 'https://devdoc.hexabase.com/docs/introduction/init',
  },
  {
    title: 'Use dashboard',
    description: 'Check the basic operation, such as workspaces, applications, and databases on the management screen.',
    href: 'https://devdoc.hexabase.com/docs/introduction/basic',
  },
  {
    title: 'Try Hexabase CLI',
    description: 'Try the Hexabase CLI (Command Line Interface). Learn how to develop efficiently using the CLI.',
    href: 'https://devdoc.hexabase.com/docs/introduction/cli',
  },
  {
    title: 'Access backend via API',
    description: 'Try Hexabase API. Learn environment and usage of API.',
    href: 'https://devdoc.hexabase.com/docs/introduction/api',
  },
  {
    title: 'Run sample app',
    description: 'Access Hexabase using TODO sample application.',
    href: 'https://devdoc.hexabase.com/docs/introduction/frontend_example',
  },
]

export default function Dashboard() {

  return (
    <div className="m-0 p-0 w-auto h-auto">
      <div className="mx-auto w-auto h-auto mt-12 px-24">
        <div style={{
          backgroundImage: 'url(https://dev.hexabase.com/img/hero_bg.svg)',
          backgroundColor: '#00C6AB',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center right'
        }}
          className="text-white rounded-3xl md:flex md:shrink-0 items-center justify-start min-h-[172px] gap-16 mb-8"
        >
          <h1 className="md:pl-8 md:block flex items-center justify-center font-bold text-3xl">
            Getting started
          </h1>
          <div className="whitespace-pre-wrap text-sm font-extralight md:p-0 p-2">
            <p>Hexabase is an enterprise BaaS (Backend as a Service) for enterprise system development.</p>
            <p>It provides high-quality backend functions that can be utilized for web application development as a cloud service.</p>
          </div>
        </div>
        <div className="lg:grid lg:grid-cols-3 gap-10 w-auto h-auto">
          <div className="h-auto overflow-hidden rounded">
            <h2 className="font-bold text-lg mb-5">Movie</h2>
            <div className="w-auto bg-black text-white p-8 rounded h-full">
              <div className="text-sm font-extralight mb-5">Have a look at the movie summarizing the development process using Hexabase.</div>
              <iframe
                width={'100%'}
                height={'225px'}
                src="https://www.youtube.com/embed/93mEcgwtx8Q"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
          <div className="col-span-2">
            <h2 className="font-bold text-lg mb-5">Steps</h2>
            <div className="text-sm font-extralight mb-5">Getting started building applications using Hexabase's development tools.</div>
            <div className="md:grid md:grid-cols-2 gap-7">
              {
                dashboardContent?.map((v, idx) => (
                  <div key={idx} className="p-5 border border-gray-400 md:max-2xl:mb-0 mb-5" style={{ boxShadow: '2px 2px 4px 2px #9e9e9e' }}>
                    <div className="flex gap-6 items-center justify-start">
                      <span className="border border-gray-800 px-3 py-1 w-auto h-auto text-center align-middle font-bold">{idx + 1}</span>
                      <div className="font-bold text-xl">{v?.title}</div>
                    </div>
                    <div className="text-sm font-extralight my-5">{v?.description}</div>
                    <button className="px-4 py-2 bg-black text-white cursor-pointer mt-10"><a href={v?.href} target={'_blank'}>Learn more</a></button>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
