type Props = {
  children?: React.ReactNode;
};

const Container = ({ children }: Props) => {
  return (
    <div className="mx-auto px-10 py-10 bg-white text-black">{children}</div>
  );
};

export default Container;
