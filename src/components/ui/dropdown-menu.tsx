'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface DropdownContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}
const DropdownContext = React.createContext<DropdownContextValue>({ open: false, setOpen: () => {} });

function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </DropdownContext.Provider>
  );
}

function DropdownMenuTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) {
  const { open, setOpen } = React.useContext(DropdownContext);
  const handleClick = () => setOpen(!open);
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: handleClick,
    });
  }
  return <button onClick={handleClick}>{children}</button>;
}

function DropdownMenuContent({
  className,
  align = 'start',
  children,
}: {
  className?: string;
  align?: 'start' | 'end';
  children: React.ReactNode;
}) {
  const { open, setOpen } = React.useContext(DropdownContext);
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      <div
        className={cn(
          'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-md top-full mt-1',
          align === 'end' ? 'right-0' : 'left-0',
          className
        )}
      >
        {children}
      </div>
    </>
  );
}

function DropdownMenuItem({
  className,
  onClick,
  children,
}: {
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const { setOpen } = React.useContext(DropdownContext);
  return (
    <div
      className={cn(
        'relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100',
        className
      )}
      onClick={() => { setOpen(false); onClick?.(); }}
    >
      {children}
    </div>
  );
}

function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn('-mx-1 my-1 h-px bg-gray-200', className)} />;
}

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator };
