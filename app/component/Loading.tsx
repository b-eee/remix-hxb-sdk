import { message } from 'antd';

const key = 'updatable';
type LoadingProps ={
  loadingProps: boolean;
}
const Loading = ({loadingProps}:LoadingProps) => {
  const openLoading = () => {
    return loadingProps ? message.loading({ content: 'Loading...', key }) : message.success({ content: 'Loaded!', key, duration: 2 });
  }

  return (
    <>{ openLoading() }</>
  )
};

export default Loading;