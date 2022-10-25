import { DatastoreRes, Datastores } from "@hexabase/hexabase-js/dist/lib/types/datastore";
import { AppAndDsRes } from "@hexabase/hexabase-js/dist/lib/types/application";
import { redirect } from "@remix-run/node";

import Plus from "../../public/assets/plus.svg";
import { Form, Link, useParams, useTransition } from "@remix-run/react";
import { Loading } from "./Loading";
import { ButtonUpdate } from "./button/buttonUpdate";
import { ButtonDelete } from "./button/buttonDelete";

interface Props {
  data?: DatastoreRes;
  appAndDs?: AppAndDsRes;
  onClickUpdateModal: (dsDetail?: Datastores) => void;
  onClickDeleteModal: (dsDetail?: Datastores) => void;
}

export const TableDataStore = ({ data, onClickDeleteModal, onClickUpdateModal, appAndDs }: Props) => {
  let lengthDs = 0;
  const { state } = useTransition();
  const loading = state === 'loading';
  const submit = state === 'submitting';
  const params = useParams();

  if (appAndDs && appAndDs?.appAndDs && appAndDs?.appAndDs?.length > 0) {
    for (const value of appAndDs?.appAndDs) {
      if (value?.datastores && value?.datastores?.length > 0) {
        lengthDs += value?.datastores?.length;
      }
    }
  }

  return (
    <>
      <div className="overflow-x-auto relative">
        <div className="flex items-center justify-between">
          {
            lengthDs >= 5
              ? <div className="p-5 bg-green-300 text-base font-semibold text-red-400">
                Cannot create a new database, the limit has been exceeded.
              </div>
              : <div></div>
          }
          <Form method="post">
            <input type={'hidden'} name={'createDs'} value={'createDs'} />
            <button
              disabled={lengthDs >= 5 ? true : false}
              className={`${lengthDs >= 5 ? 'cursor-not-allowed bg-gray-300' : 'transition duration-150 ease-in-out hover:scale-110 hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'} m-5 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm`}
            >
              <img src={Plus} alt="edit" width={15} height={15} className='mr-2' />
              Add Datastore
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
                  <tr key={ds?.d_id} className='bg-white hover:bg-gray-100 border-b'>
                    <td className="text-xs text-gray-70 dark:bg-gray-700 dark:text-gray-400 py-4 px-6">{index + 1}</td>
                    <td className="text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-400 py-4 px-6"> <Link to={`datastore/${ds?.d_id}`}>{ds?.name}</Link></td>
                    <td className="text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-400 py-4 px-6">{ds?.display_id}</td>
                    <td className="py-4 px-6 dark:bg-gray-700 dark:text-gray-400 flex items-center justify-start w-auto">
                      <ButtonUpdate onClick={() => onClickUpdateModal(ds)} text={'Update'} className='mx-4' />
                      <ButtonDelete onClick={() => onClickDeleteModal(ds)} text={'Delete'} />
                    </td>
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