export default function Hero() {
  return (
    <section className="relative w-full bg-[#F8F5F0] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[600px] lg:min-h-[680px] py-12 lg:py-0">
          
          {/* Left Content */}
          <div className="flex flex-col justify-center order-2 lg:order-1 z-10">
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-semibold text-[#3D2B1F] leading-tight tracking-tight">
              Lestarikan Wastra,<br />
              Bangga Berbudaya
            </h1>

            <p className="mt-5 text-base sm:text-lg text-[#5C4A3A] max-w-md leading-relaxed">
              Temukan keindahan batik dari berbagai daerah di Indonesia. Dukung pengrajin lokal, lestarikan warisan negeri.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button className="px-7 py-3.5 bg-[#3D2B1F] text-white rounded-full font-medium text-sm hover:bg-[#2A1D14] transition-colors shadow-sm">
                Belanja Sekarang
              </button>
              <button className="px-7 py-3.5 bg-white border border-[#D4C4B0] text-[#3D2B1F] rounded-full font-medium text-sm hover:bg-[#F5F0E8] transition-colors">
                Jelajahi Koleksi
              </button>
            </div>

            {/* Trust badges */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#EDE6DC] flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-[#3D2B1F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#3D2B1F]">100% Original</p>
                  <p className="text-xs text-[#8B7355] mt-0.5">Batik asli dari pengrajin lokal</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#EDE6DC] flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-[#3D2B1F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#3D2B1F]">Pengrajin Lokal</p>
                  <p className="text-xs text-[#8B7355] mt-0.5">Memberdayakan dan mendukung UMKM</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#EDE6DC] flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-[#3D2B1F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#3D2B1F]">Pengiriman Aman</p>
                  <p className="text-xs text-[#8B7355] mt-0.5">Packing rapi, pengiriman cepat</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#EDE6DC] flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-[#3D2B1F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#3D2B1F]">Pembayaran Aman</p>
                  <p className="text-xs text-[#8B7355] mt-0.5">Transaksi aman dan terpercaya</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative order-1 lg:order-2 flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-[520px] lg:max-w-none">
              <img
                src="/images/hero-batik.png"
                alt="Batik WastraHub"
                className="w-full h-auto object-contain"
                style={{
                  filter: "drop-shadow(0 25px 50px rgba(61, 43, 31, 0.25))",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}