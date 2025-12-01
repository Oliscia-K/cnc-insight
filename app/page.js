import Image from "next/image";

export default function Home() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg:black">
      <main className="flex min-h-screen w-full flex-col items-center justify-center space-y-5 bg-black text-zinc-50">
        <div className="flex flex-col items-center text-center">
          <h1 className=" text-3xl font-semibold leading-10 tracking-tight text-zinc-50">
            Welcome to CNC Insight - Your Visual Insider
          </h1>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium">
          <a
            className="flex h-18 w-lg items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#ccc]"
            href="/fileUpload"
          >
            Visualize New Data
          </a>
          <a
            className="flex h-18 w-lg items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#ccc]"
            href="/graphHistory"
          >
            View Previous Visualizations
          </a>
        </div>
      </main>
    </div>
  );
}
