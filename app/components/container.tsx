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
        "m-10 mx-auto relative rounded-[2rem] border-2 border-black bg-white px-12 py-16",
        className ?? ""
      )}>
      {children}
    </div>
  );
};

export default Container;