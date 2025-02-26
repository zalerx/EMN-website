import React from 'react';
import { cn } from '@/app/lib/utils'

interface ContainerProps {
  className?: string;
  children: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({className, children }) => {
  return (
    <div
    className={cn(
        "m-3 md:m-10 mx-auto relative rounded-[1rem] md:rounded-[2rem] border-2 border-black bg-white px-4 py-5 md:px-12 md:py-16",
        className ?? ""
      )}>
      {children}
    </div>
  );
};

export default Container;