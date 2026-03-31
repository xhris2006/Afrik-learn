// src/app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 gradient-header flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute top-1/2 right-[-40px] w-40 h-40 rounded-full bg-white/5" />

        <div className="relative z-10 text-center text-white max-w-md">
          {/* Logo */}
          <div className="w-20 h-20 bg-white/15 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm border border-white/20">
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <path d="M22 4L4 14v4l18 10 18-10v-4L22 4z" fill="white" opacity="0.9"/>
              <path d="M4 26l18 10 18-10" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7"/>
              <path d="M4 20l18 10 18-10" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            </svg>
          </div>

          <h1 className="text-4xl font-display font-bold mb-4">AfrikLearn</h1>
          <p className="text-xl text-white/80 font-medium mb-2">Study Smarter. Together.</p>
          <p className="text-white/60 leading-relaxed">
            Access thousands of course materials, past exam papers, and connect
            with students across African universities.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-10">
            {[
              { value: '5,000+', label: 'Documents' },
              { value: '12K+', label: 'Students' },
              { value: '8', label: 'Universities' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-white/60 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 gradient-header rounded-2xl flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 44 44" fill="none">
                <path d="M22 4L4 14v4l18 10 18-10v-4L22 4z" fill="white"/>
              </svg>
            </div>
            <span className="text-xl font-display font-bold text-primary">AfrikLearn</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
