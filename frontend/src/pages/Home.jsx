import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      <Navbar />

      <div className="flex items-center justify-center p-10">
        <div className="max-w-xl text-center">
          <h1 className="text-5xl font-extrabold text-[#0F172A]">
            Smart Delivery Platform
          </h1>

          <p className="mt-4 text-[#0F172A]/70 text-lg">
            Manage deliveries, track drivers, and monitor performance with ease.
          </p>
        </div>
      </div>
    </div>
  );
}