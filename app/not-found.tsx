import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center"
      style={{
        backgroundImage: `url('/wishes2.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="w-full max-w-md p-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Wishboard Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          The wishboard you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Link
          href="/"
          className="inline-block bg-purple-600 text-white rounded-lg py-3 px-6 font-medium hover:bg-purple-700 transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
