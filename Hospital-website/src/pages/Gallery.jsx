import GalleryGrid from '../components/GalleryGrid';

export default function Gallery() {
  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-slate-50 py-24 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Hospital Gallery</h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
            Take a visual tour of our state-of-the-art facilities, advanced medical equipment, and dedicated care environments.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <GalleryGrid />

        {/* Video Section Placeholder */}
        <div className="mt-24 bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center overflow-hidden relative">
          <div className="absolute inset-0 opacity-20">
            <img
              src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2000"
              alt="Hospital Video"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Watch Our Virtual Tour</h2>
            <p className="text-slate-400 text-lg mb-10">
              Experience our hospital through a comprehensive video tour showcasing our patient-first approach.
            </p>
            <button type="button" className="px-6 py-4 bg-amber-400 text-slate-950 rounded-2xl flex items-center justify-center mx-auto font-bold uppercase tracking-wider shadow-xl shadow-amber-400/30 cursor-default">
              Virtual tour coming soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
