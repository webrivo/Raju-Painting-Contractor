import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Paintbrush, 
  Phone, 
  MapPin, 
  ArrowRight, 
  Palette, 
  Home, 
  Layers, 
  Star, 
  Menu, 
  X, 
  CheckCircle2, 
  Brush,
  PaintRoller,
  Droplets
} from 'lucide-react';

/**
 * UTILITIES & HOOKS
 */

// Hook for Intersection Observer (Scroll Reveal)
const useScrollReveal = (options = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, options);

    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [options]);

  return [ref, isVisible] as const;
};

// Hook for Magnetic Button Effect
const useMagnetic = () => {
  const ref = useRef<HTMLElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: any) => {
    const { clientX, clientY } = e;
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * 0.35; // Sensitivity
    const y = (clientY - (top + height / 2)) * 0.35;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return { ref, position, handleMouseMove, handleMouseLeave };
};

/**
 * COMPONENTS
 */

// 1. Noise Overlay (Award Winning Texture)
const NoiseOverlay = () => (
  <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-overlay">
    <svg className='w-full h-full'>
      <filter id='noiseFilter'>
        <feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch' />
      </filter>
      <rect width='100%' height='100%' filter='url(#noiseFilter)' />
    </svg>
  </div>
);

// 2. Preloader
const Preloader = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black text-white transition-all duration-700 ease-in-out"
         style={{ transform: loading ? 'translateY(0)' : 'translateY(-100%)' }}>
      <div className="text-center px-4">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter animate-pulse">
          RAJU PAINTING
        </h1>
        <div className="mt-4 h-1 w-32 bg-gray-800 mx-auto overflow-hidden rounded-full">
          <div className="h-full bg-orange-500 w-full animate-progress origin-left"></div>
        </div>
      </div>
    </div>
  );
};

// 3. Magnetic Button Component
const MagneticButton = ({ children, className, onClick, href }: any) => {
  const { ref, position, handleMouseMove, handleMouseLeave } = useMagnetic();

  const style = { transform: `translate(${position.x}px, ${position.y}px)` };
  const combinedClassName = `relative transition-transform duration-200 ease-out active:scale-95 inline-flex items-center justify-center ${className}`;

  const handleClick = (e: any) => {
    if (onClick) onClick(e);
    
    // Intercept internal hash links for smooth scroll without hash update
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    // Allow 'tel:' links to proceed normally
  };

  if (href) {
    return (
      <a
        ref={ref as any}
        href={href}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={style}
        className={combinedClassName}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      ref={ref as any}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={style}
      className={combinedClassName}
    >
      {children}
    </button>
  );
};

// 4. Navbar
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { name: 'Home', href: '#hero' },
    { name: 'Services', href: '#services' },
    { name: 'Projects', href: '#projects' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    // Intercept internal hash links
    if (href.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      setIsOpen(false);
    }
  };

  return (
    <nav 
      className={`fixed top-0 w-full z-[5000] transition-all duration-300 ${
        isOpen 
          ? 'py-3 md:py-4 bg-white border-b border-gray-100' // Open state: solid white, no blur to fix stacking context clipping
          : scrolled 
            ? 'py-3 md:py-4 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm' 
            : 'py-4 md:py-6 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center relative z-[5001]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold">R</div>
          <span className={`text-lg md:text-xl font-bold tracking-tight text-gray-900`}>Raju Painting</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors"
            >
              {link.name}
            </a>
          ))}
          <MagneticButton href="tel:9980229003" className="bg-black text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-800">
            Call Now
          </MagneticButton>
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="md:hidden p-2 text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer z-[5002]"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[4999] bg-white flex flex-col items-center justify-center gap-8 animate-in slide-in-from-top-10 md:hidden overflow-y-auto h-[100dvh]">
          {links.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-4xl font-bold text-gray-900 hover:text-orange-500 transition-colors"
            >
              {link.name}
            </a>
          ))}
          <a href="tel:9980229003" className="bg-orange-500 text-white px-8 py-4 rounded-full text-xl font-bold mt-4 shadow-xl shadow-orange-200 active:scale-95 transition-transform">
            Call 99802 29003
          </a>
        </div>
      )}
    </nav>
  );
};

// 5. Hero Section with Kinetic Typography
const Hero = () => {
  return (
    <section id="hero" className="relative min-h-[90vh] md:min-h-screen flex flex-col justify-center overflow-hidden pt-24 pb-12 md:py-0">
      {/* Background Blobs */}
      <div className="absolute top-20 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-orange-200/40 rounded-full blur-[80px] md:blur-[100px] -z-10 animate-float" />
      <div className="absolute bottom-0 left-0 w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-blue-200/30 rounded-full blur-[60px] md:blur-[80px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 w-full z-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
        {/* Content - First on Mobile */}
        <div className="flex flex-col justify-center items-start">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-600 mb-6">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Bangalore's Finest
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 leading-[1.1] md:leading-[0.9] tracking-tighter mb-6">
            BRINGING <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">COLORS</span> TO <br />
            YOUR LIFE.
          </h1>
          <p className="text-base md:text-xl text-gray-600 max-w-lg mb-8 leading-relaxed">
            Premium painting services for residential and commercial spaces in Bangalore. We transform visions into vibrant reality.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <MagneticButton href="#contact" className="bg-gray-900 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-gray-800 shadow-xl shadow-gray-200 w-full sm:w-auto">
               Get a Quote <ArrowRight size={20} />
            </MagneticButton>
            <MagneticButton href="#projects" className="bg-white text-gray-900 border border-gray-200 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-50 w-full sm:w-auto">
              View Works
            </MagneticButton>
          </div>
        </div>
        
        {/* Image - Second on Mobile */}
        <div className="relative h-[300px] md:h-[600px] w-full mt-4 md:mt-0">
           {/* Abstract Composition */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full md:w-[80%] h-full md:h-[80%] rounded-3xl md:rounded-[2rem] overflow-hidden shadow-2xl rotate-0 md:rotate-3 transition-transform hover:rotate-0 duration-700 ease-out">
              <img 
                src="https://images.jdmagicbox.com/v2/comp/bangalore/n9/080pxx80.xx80.170619143508.d2n9/catalogue/raju-painting-contrator-basaveshwara-nagar-bangalore-painting-contractors-for-building-1k1mzeq3y6.jpg" 
                alt="Main" 
                className="w-full h-full object-cover md:scale-110 hover:scale-100 transition-transform duration-1000"
              />
           </div>
           
           {/* Floating Badge */}
           <div className="absolute -bottom-4 right-4 md:bottom-10 md:left-0 md:right-auto bg-white p-3 md:p-4 rounded-2xl shadow-xl border border-gray-100 animate-float z-20" style={{animationDelay: '1s'}}>
              <div className="flex items-center gap-3">
                 <div className="bg-green-100 p-2 rounded-full text-green-600">
                    <CheckCircle2 size={20} className="md:w-6 md:h-6" />
                 </div>
                 <div>
                    <p className="text-[10px] md:text-xs text-gray-500 font-semibold uppercase">Experience</p>
                    <p className="text-base md:text-lg font-bold text-gray-900">15+ Years</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Marquee Text */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden py-2 md:py-4 bg-gray-900/5 rotate-1">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(6)].map((_, i) => (
             <span key={i} className="text-4xl md:text-8xl font-black text-transparent stroke-text px-4 md:px-8 opacity-20 uppercase">
                Painting • Polishing • Texture •
             </span>
          ))}
        </div>
      </div>
    </section>
  );
};

// 6. Bento Grid Services
const ServicesBento = () => {
  const [ref, isVisible] = useScrollReveal();

  const services = [
    { 
      title: "Wood Polishing", 
      desc: "Premium finish for furniture.", 
      img: "https://images.jdmagicbox.com/comp/service_catalogue/wood-polishing-services-080pxx80.xx80.170619143508.d2n9-8fjbxth.jpg",
      col: "md:col-span-2 md:row-span-2",
      icon: <Layers size={24} />
    },
    { 
      title: "Wall Painting", 
      desc: "Interior & Exterior experts.", 
      img: "https://images.jdmagicbox.com/comp/service_catalogue/wall-painting-services-080pxx80.xx80.170619143508.d2n9-eg5ztie.jpg",
      col: "md:col-span-1 md:row-span-1",
      icon: <PaintRoller size={24} />
    },
    { 
      title: "Exterior Texture", 
      desc: "Weather-proof textures.", 
      img: "https://images.jdmagicbox.com/comp/service_catalogue/painting-contractors-for-exterior-texture-080pxx80.xx80.170619143508.d2n9-bpov0mo.jpg",
      col: "md:col-span-1 md:row-span-1",
      icon: <Palette size={24} />
    },
    { 
      title: "Bungalow Painting", 
      desc: "Complete home makeovers.", 
      img: "https://images.jdmagicbox.com/comp/service_catalogue/painting-contractors-for-bungalow-080pxx80.xx80.170619143508.d2n9-7r9o8ep.jpg",
      col: "md:col-span-2 md:row-span-1",
      icon: <Home size={24} />
    },
  ];

  return (
    <section id="services" className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="mb-12 md:mb-16 text-center max-w-2xl mx-auto">
          <span className="text-orange-600 font-bold tracking-widest text-sm uppercase">Our Expertise</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-2 text-gray-900">Mastery in Every Stroke</h2>
        </div>

        <div ref={ref} className={`grid grid-cols-2 md:grid-cols-4 md:grid-rows-3 gap-3 md:gap-6 h-auto md:h-[600px] transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          {services.map((service, idx) => (
            <div 
              key={idx} 
              className={`group relative overflow-hidden rounded-2xl md:rounded-3xl bg-white shadow-sm border border-gray-100 ${service.col} cursor-pointer hover:shadow-xl transition-all duration-500 min-h-[180px] md:min-h-auto`}
            >
              <div className="absolute inset-0 bg-gray-900/10 group-hover:bg-gray-900/0 transition-all duration-500 z-10" />
              <img 
                src={service.img} 
                alt={service.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute bottom-0 left-0 w-full p-3 md:p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white mb-2 md:mb-3">
                  {/* Clone icon to adjust size for mobile if needed, or just let CSS handle scaling of container */}
                  {React.cloneElement(service.icon as React.ReactElement<any>, { size: 18, className: 'md:hidden' })}
                  {React.cloneElement(service.icon as React.ReactElement<any>, { size: 24, className: 'hidden md:block' })}
                </div>
                <h3 className="text-white text-sm md:text-2xl font-bold leading-tight">{service.title}</h3>
                <p className="text-gray-200 text-xs md:text-sm mt-1 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hidden md:block">
                  {service.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// 7. Scrollytelling Section (About)
const AboutScrolly = () => {
  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        <div className="relative order-2 md:order-1">
           <div className="absolute -top-10 -left-10 w-32 h-32 bg-orange-100 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
           <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
           
           <div className="relative rounded-3xl overflow-hidden shadow-2xl rotate-0 md:rotate-2 hover:rotate-0 transition-all duration-500">
             <img src="https://images.jdmagicbox.com/comp/service_catalogue/painting-contractors-080pxx80.xx80.170619143508.d2n9-qu28fqf.jpg" alt="About" className="w-full" />
           </div>
        </div>
        
        <div className="space-y-6 md:space-y-8 order-1 md:order-2">
          <h2 className="text-3xl md:text-5xl font-bold leading-tight">
            We don't just paint walls. <br />
            <span className="text-gray-400">We paint experiences.</span>
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="p-3 rounded-xl bg-orange-50 text-orange-600 shrink-0">
                <Star size={24} />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900">Premium Quality</h3>
                <p className="text-gray-500 mt-2 leading-relaxed text-sm md:text-base">We use only top-tier materials like Asian Paints, Berger, and Dulux to ensure longevity and finish.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
               <div className="p-3 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <Brush size={24} />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900">Skilled Artisans</h3>
                <p className="text-gray-500 mt-2 leading-relaxed text-sm md:text-base">Our team consists of verified professionals with over 10 years of experience in textures and finishes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// 8. Horizontal Scroll Projects (Simulated for Mobile/Desktop Hybrid)
const ProjectGallery = () => {
  const scrollRef = useRef<any>(null);
  
  const projects = [
    "https://images.jdmagicbox.com/comp/service_catalogue/painting-contractors-for-building-080pxx80.xx80.170619143508.d2n9-yi971jw.jpg",
    "https://images.jdmagicbox.com/comp/service_catalogue/house-painters-080pxx80.xx80.170619143508.d2n9-0jqcfc8.jpg",
    "https://images.jdmagicbox.com/comp/service_catalogue/painting-contractors-for-bungalow-080pxx80.xx80.170619143508.d2n9-7r9o8ep.jpg",
    "https://images.jdmagicbox.com/comp/service_catalogue/wood-polishing-services-080pxx80.xx80.170619143508.d2n9-8fjbxth.jpg"
  ];

  return (
    <section id="projects" className="py-16 md:py-24 bg-gray-900 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-12 flex justify-between items-end">
        <div>
           <span className="text-orange-500 font-bold tracking-widest text-sm uppercase">Portfolio</span>
           <h2 className="text-3xl md:text-5xl font-bold mt-2">Recent Transformations</h2>
        </div>
        <div className="hidden md:flex gap-2">
           <button onClick={() => scrollRef.current.scrollBy({left: -300, behavior: 'smooth'})} className="p-3 rounded-full border border-gray-700 hover:bg-gray-800"><ArrowRight className="rotate-180" /></button>
           <button onClick={() => scrollRef.current.scrollBy({left: 300, behavior: 'smooth'})} className="p-3 rounded-full border border-gray-700 hover:bg-gray-800"><ArrowRight /></button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-3 md:gap-6 px-4 md:px-6 pb-12 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollBehavior: 'smooth' }}
      >
        {projects.map((img, i) => (
          <div key={i} className="min-w-[42vw] md:min-w-[400px] h-[200px] md:h-[500px] relative rounded-2xl md:rounded-3xl overflow-hidden snap-center group shrink-0">
             <img src={img} alt={`Project ${i}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" />
             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
             <div className="absolute bottom-3 left-3 md:bottom-8 md:left-8">
               <span className="text-orange-400 text-[10px] md:text-sm font-bold uppercase tracking-wider mb-1 md:mb-2 block">Project 0{i+1}</span>
               <h3 className="text-sm md:text-2xl font-bold">Residential Complex</h3>
               <p className="text-gray-300 text-[10px] md:text-sm mt-0 md:mt-1 hidden md:block">Basaveshwara Nagar</p>
             </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// 9. Sticky Card Process
const ProcessSteps = () => {
  const steps = [
    { title: "Consultation", desc: "We visit your site, assess requirements, and provide a detailed quote.", color: "bg-blue-50" },
    { title: "Preparation", desc: "Masking furniture, sanding walls, and ensuring a dust-free environment.", color: "bg-orange-50" },
    { title: "Execution", desc: "Applying primer, putty, and premium paints with precision tools.", color: "bg-green-50" },
    { title: "Handover", desc: "Deep cleaning and final inspection before handing over the keys.", color: "bg-purple-50" },
  ];

  return (
    <section className="py-16 md:py-24 max-w-4xl mx-auto px-4 md:px-6">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16">The Process</h2>
      <div className="space-y-6">
        {steps.map((step, i) => (
          <div key={i} className={`md:sticky top-20 md:top-24 p-6 md:p-8 rounded-3xl border border-gray-100 shadow-lg ${step.color} transition-transform origin-top hover:-translate-y-2`}>
             <div className="flex items-center gap-4 mb-3 md:mb-4">
               <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold shadow-sm shrink-0">{i+1}</div>
               <h3 className="text-xl md:text-2xl font-bold">{step.title}</h3>
             </div>
             <p className="text-base md:text-lg text-gray-600 md:ml-14">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

// 10. Contact Section (Simplified)
const Contact = () => {
  return (
    <section id="contact" className="py-16 md:py-24 bg-gray-900 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-[120px] pointer-events-none" />
       
      <div className="max-w-5xl mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">Contact Us</h2>
          <p className="text-gray-400 text-base md:text-lg">Ready to transform your space? Get in touch for a quote.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-12">
            {/* Phone */}
            <div className="flex flex-col items-center text-center p-8 md:p-10 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
               <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-orange-500 flex items-center justify-center mb-6 text-white shadow-lg shadow-orange-500/30">
                  <Phone size={24} className="md:w-8 md:h-8" />
               </div>
               <h3 className="text-gray-400 uppercase tracking-widest text-xs md:text-sm font-semibold mb-2">Call Us</h3>
               <a href="tel:9980229003" className="text-2xl md:text-4xl font-bold hover:text-orange-400 transition-colors">
                 99802 29003
               </a>
            </div>

            {/* Address */}
            <div className="flex flex-col items-center text-center p-8 md:p-10 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
               <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-blue-600 flex items-center justify-center mb-6 text-white shadow-lg shadow-blue-600/30">
                  <MapPin size={24} className="md:w-8 md:h-8" />
               </div>
               <h3 className="text-gray-400 uppercase tracking-widest text-xs md:text-sm font-semibold mb-2">Visit Us</h3>
               <address className="text-base md:text-lg font-medium not-italic leading-relaxed max-w-md">
                  No. 56/52, Near Shardha Colony Bus Stop, 11th Cross, Karekallu, Kamakshipalya, Basaveshwara Nagar, Bangalore-560079
               </address>
            </div>
        </div>
        
        <div className="mt-16 md:mt-20 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            © 2024 Raju Painting Contractor
        </div>
      </div>
    </section>
  );
};

// Main App Component
const App = () => {
  return (
    <div className="font-sans text-gray-900 bg-white selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;900&display=swap');
        
        body { font-family: 'Inter', sans-serif; }
        html { scroll-behavior: smooth; }

        .stroke-text {
          -webkit-text-stroke: 1px rgba(0,0,0,0.1);
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee { animation: marquee 20s linear infinite; }
        
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        
        @keyframes progress {
            0% { transform: scaleX(0); }
            100% { transform: scaleX(1); }
        }
        .animate-progress { animation: progress 2s ease-out forwards; }
        
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>

      <Preloader />
      <NoiseOverlay />
      <Navbar />
      
      <main>
        <Hero />
        <ServicesBento />
        <AboutScrolly />
        <ProjectGallery />
        <ProcessSteps />
        <Contact />
      </main>

      {/* Simple Footer */}
      <footer className="py-8 text-center text-gray-400 text-sm bg-gray-50">
        <p>Made with ❤️ in Bangalore</p>
      </footer>
    </div>
  );
};

export default App;