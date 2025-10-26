import { Navbar } from "@/modules/home/ui/components/navbar";

interface Props {
    children: React.ReactNode;
}

const HomeLayout = ({ children }: Props) => {
    return (
        <main className="flex flex-col min-h-screen max-h-screen">
            <Navbar />
            <div className="absolute inset-0 -z-10 h-full w-full bg-background"/>
            <div className="flex-1 flex flex-col px-4 pb-4 ">
                {children}
            </div>
        </main>
    )
}

export default HomeLayout;