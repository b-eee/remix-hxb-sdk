import { DatastoreRes } from "@hexabase/hexabase-js/dist/lib/types/datastore";
import Edit from "../../public/assets/edit.svg";
import Delete from "../../public/assets/delete.svg";
import Plus from "../../public/assets/plus.svg";
import { Form, useTransition } from "@remix-run/react";
import { Loading } from "./Loading";

interface Props {
  data: DatastoreRes;
  onClickUpdateModal: () => void;
  onClickDeleteModal: () => void;
}

export const TableDataStore = ({ data, onClickDeleteModal, onClickUpdateModal }: Props) => {
  let lengthDs = 0;
  const { state } = useTransition();
  const loading = state === 'loading';
  const submit = state === 'submitting';
  if (data && data?.datastores)
    lengthDs = data?.datastores.length;
  return (
    <>
      <div className="overflow-x-auto relative">
        <div className="flex items-center justify-between">
          {
            lengthDs >= 5 ? <div className="p-5 bg-green-300 text-base font-semibold text-red-400">
              Cannot create a new database, the limit has been exceeded.
            </div>
            : <div></div>
          }
          <Form method="post">
            <input type={'hidden'} name={'createDs'} value={'createDs'} />
            <button
              disabled={lengthDs >= 5 ? true : false}
              // onClick={() => { onClickNewModal(), onClickDeleteModal(), onClickUpdateModal() }}
              className={`${lengthDs >= 5 ? 'cursor-not-allowed bg-gray-300' : 'transition duration-150 ease-in-out hover:scale-110 hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'} m-5 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm`}
            >
              <img src={Plus} alt="edit" width={15} height={15} className='mr-2' />
              New
            </button>
          </Form>
        </div>
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="py-3 px-6">STT</th>
              <th scope="col" className="py-3 px-6">Name EN</th>
              <th scope="col" className="py-3 px-6">Datastore ID</th>
              <th scope="col" className="py-3 px-6">Action</th>
            </tr>
          </thead>
          <tbody>
            {
              data && data?.datastores && data?.datastores?.length > 0 ? data?.datastores?.map((ds, index) => {
                return (
                  <tr key={ds?.d_id}>
                    <td className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 py-4 px-6">{index + 1}</td>
                    <td className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 py-4 px-6">{ds?.name}</td>
                    <td className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 py-4 px-6">{ds?.display_id}</td>
                    <td className="py-4 px-6 bg-gray-50 dark:bg-gray-700 dark:text-gray-400 flex items-center justify-start w-auto">
                      <button
                        onClick={() => { onClickDeleteModal(), onClickUpdateModal() }}
                        className='transition duration-150 ease-in-out hover:scale-110 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
                      >
                        <img src={Edit} alt="edit" width={15} height={15} className='mr-2' />
                        Update
                      </button>
                      <button
                        onClick={() => { onClickDeleteModal(), onClickUpdateModal() }}
                        className='transition duration-150 ease-in-out hover:scale-110 mx-5 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                      >
                        <img src={Delete} alt="edit" width={15} height={15} className='mr-2' />
                        Delete
                      </button>                    </td>
                  </tr>
                );
              })
                : <tr>
                  <td className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 py-4 px-6">Not Record</td>
                </tr>
            }
          </tbody>
        </table>
      </div>

      {loading && <Loading />}
      {submit && <Loading />}
    </>
  )
};