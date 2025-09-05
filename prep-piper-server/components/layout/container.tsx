// components/layout/Container.tsx
export function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      {children}
    </div>
  );
}
