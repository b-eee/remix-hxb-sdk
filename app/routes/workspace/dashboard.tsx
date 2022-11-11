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
          className="text-white rounded-3xl flex items-center justify-start min-h-[172px] gap-16 mb-8"
        >
          <h1 className="pl-8 font-bold text-3xl">
            Getting started
          </h1>
          <div className="whitespace-pre-wrap text-sm font-extralight">
            <p>Hexabase is an enterprise BaaS (Backend as a Service) for enterprise system development.</p>
            <p>It provides high-quality backend functions that can be utilized for web application development as a cloud service.</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-10 w-auto h-auto">
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
            <div className="grid grid-cols-2 gap-7">
              <div className="p-5 border border-gray-400" style={{ boxShadow: '2px 2px 4px 2px #9e9e9e' }}>
                <div className="flex gap-6 items-center justify-start">
                  <span className="border border-gray-800 px-3 py-1 w-auto h-auto text-center align-middle font-bold">1</span>
                  <div className="font-bold text-xl">Try sample app</div>
                </div>
                <div className="text-sm font-extralight my-5">Try sample application.TODO management application is provided as a sample.</div>
                <button className="px-4 py-2 bg-black text-white cursor-pointer mt-10"><a href="https://devdoc.hexabase.com/docs/introduction/demo">Learn more</a></button>
              </div>
              <div className="p-5 border border-gray-400" style={{ boxShadow: '2px 2px 4px 2px #9e9e9e' }}>
                <div className="flex gap-6 items-center justify-start">
                  <span className="border border-gray-800 px-3 py-1 w-auto h-auto text-center align-middle font-bold">2</span>
                  <div className="font-bold text-xl">Add database</div>
                </div>
                <div className="text-sm font-extralight my-5">Create database for your application using a template.</div>
                <button className="px-4 py-2 bg-black text-white cursor-pointer mt-10"><a href="https://devdoc.hexabase.com/docs/introduction/init">Learn more</a></button>
              </div>
              <div className="p-5 border border-gray-400" style={{ boxShadow: '2px 2px 4px 2px #9e9e9e' }}>
                <div className="flex gap-6 items-center justify-start">
                  <span className="border border-gray-800 px-3 py-1 w-auto h-auto text-center align-middle font-bold">3</span>
                  <div className="font-bold text-xl">Use dashboard</div>
                </div>
                <div className="text-sm font-extralight my-5">Check the basic operation, such as workspaces, applications, and databases on the management screen.</div>
                <button className="px-4 py-2 bg-black text-white cursor-pointer mt-10"><a href="https://devdoc.hexabase.com/docs/introduction/basic">Learn more</a></button>
              </div>
              <div className="p-5 border border-gray-400" style={{ boxShadow: '2px 2px 4px 2px #9e9e9e' }}>
                <div className="flex gap-6 items-center justify-start">
                  <span className="border border-gray-800 px-3 py-1 w-auto h-auto text-center align-middle font-bold">4</span>
                  <div className="font-bold text-xl">Try Hexabase CLI</div>
                </div>
                <div className="text-sm font-extralight my-5">Try the Hexabase CLI (Command Line Interface). Learn how to develop efficiently using the CLI.</div>
                <button className="px-4 py-2 bg-black text-white cursor-pointer mt-10"><a href="https://devdoc.hexabase.com/docs/introduction/cli">Learn more</a></button>
              </div>
              <div className="p-5 border border-gray-400" style={{ boxShadow: '2px 2px 4px 2px #9e9e9e' }}>
                <div className="flex gap-6 items-center justify-start">
                  <span className="border border-gray-800 px-3 py-1 w-auto h-auto text-center align-middle font-bold">5</span>
                  <div className="font-bold text-xl">Access backend via API</div>
                </div>
                <div className="text-sm font-extralight my-5">Try Hexabase API. Learn environment and usage of API.</div>
                <button className="px-4 py-2 bg-black text-white cursor-pointer mt-10"><a href="https://devdoc.hexabase.com/docs/introduction/api">Learn more</a></button>
              </div>
              <div className="p-5 border border-gray-400" style={{ boxShadow: '2px 2px 4px 2px #9e9e9e' }}>
                <div className="flex gap-6 items-center justify-start">
                  <span className="border border-gray-800 px-3 py-1 w-auto h-auto text-center align-middle font-bold">6</span>
                  <div className="font-bold text-xl">Run sample app</div>
                </div>
                <div className="text-sm font-extralight my-5">Access Hexabase using TODO sample application.</div>
                <button className="px-4 py-2 bg-black text-white cursor-pointer mt-10"><a href="https://devdoc.hexabase.com/docs/introduction/frontend_example">Learn more</a></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
