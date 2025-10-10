type Props = {
  children?: React.ReactNode;
};

const Container = ({ children }: Props) => {
  return (
    <div className="mx-auto px-10 py-10 bg-white dark:bg-slate-900 text-black dark:text-white">{children}</div>
  );
};

export default Container;
