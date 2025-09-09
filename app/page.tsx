import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="flex justify-end p-4">
        <div className="flex gap-4">
          <Link href="/login">
            <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
              Log In
            </button>
          </Link>
          <Link href="/signup">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Sign Up
            </button>
          </Link>
        </div>
      </nav>

      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Todo-Today
        </h1>
        <h3 className="text-xl text-gray-600 mb-8">
          Your daily assistant for planning
        </h3>
        <div>
          <p className="text-gray-700 mb-6">
            Click the Button below to get started!
          </p>
          <Link href="/signup">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
