import { useState, useEffect, useRef } from "react";

const SLIDES = [
  {
    img: "/hero1.png",
    tag: "Remote Work Redefined",
    title: "WORK BEYOND\nBOUNDARIES.",
    sub: "The all-in-one productivity suite built for remote teams that demand excellence.",
  },
  {
    img: "/hero2.png",
    tag: "Team Intelligence",
    title: "MONITOR.\nANALYZE. GROW.",
    sub: "Real-time team insights and performance analytics at your fingertips.",
  },
  {
    img: "/hero3.png",
    tag: "Deep Focus Tools",
    title: "UNLOCK PEAK\nPRODUCTIVITY.",
    sub: "Pomodoro timers, task boards, and screenshot monitoring — all in one place.",
  },
];

const TEAM = [
  { name: "Dhruvil Patel", role: "Lead Architect", avatar: "DP" },
  { name: "Ava Chen", role: "Head of Design", avatar: "AC" },
  { name: "Marcus Reid", role: "Security Specialist", avatar: "MR" },
  { name: "Priya Nair", role: "Product Manager", avatar: "PN" },
];

const FAQS = [
  { q: "How does screenshot monitoring work?", a: "Our agent captures periodic screenshots and uploads them securely to Cloudinary. Managers can review activity in real time from their dashboard." },
  { q: "Is my data secure?", a: "All data is encrypted in transit and at rest. We use MongoDB Atlas for storage and JWTs for stateless authentication." },
  { q: "Can I use this for my remote team right now?", a: "Yes! Sign up as a Manager, invite your team, and start tracking productivity immediately — no setup required." },
  { q: "How are OTPs sent?", a: "Email verification OTPs are sent via Brevo's transactional email API for reliable delivery." },
];

const Landing = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeFaq, setActiveFaq] = useState(null);
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactSent, setContactSent] = useState(false);

  // Section refs for smooth scroll
  const featuresRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);
  const pricingRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % SLIDES.length), 5500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (ref) => { ref.current?.scrollIntoView({ behavior: "smooth" }); setNavOpen(false); };

  const handleContact = (e) => {
    e.preventDefault();
    setContactSent(true);
    setTimeout(() => setContactSent(false), 4000);
    setContactForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">

      {/* ── STICKY NAV ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-sm tracking-wider">RT</span>
            </div>
            <span className={`font-bold text-lg tracking-tight ${scrolled ? "text-gray-900" : "text-white"}`}>
              Remote Tracker
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "Features", ref: featuresRef },
              { label: "About", ref: aboutRef },
              { label: "Pricing", ref: pricingRef },
              { label: "Contact", ref: contactRef },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => scrollTo(item.ref)}
                className={`text-sm font-medium transition-colors hover:opacity-70 ${scrolled ? "text-gray-700" : "text-white"}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => (window.location.hash = "login")}
              className={`text-sm font-medium px-5 py-2.5 rounded-lg transition-all ${scrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10"}`}>
              Sign In
            </button>
            <button onClick={() => (window.location.hash = "signup")}
              className="bg-black text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors">
              Get Started →
            </button>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2" onClick={() => setNavOpen(!navOpen)}>
            <div className={`w-5 h-0.5 mb-1 transition-all ${scrolled ? "bg-gray-900" : "bg-white"} ${navOpen ? "rotate-45 translate-y-1.5" : ""}`}></div>
            <div className={`w-5 h-0.5 mb-1 transition-all ${scrolled ? "bg-gray-900" : "bg-white"} ${navOpen ? "opacity-0" : ""}`}></div>
            <div className={`w-5 h-0.5 transition-all ${scrolled ? "bg-gray-900" : "bg-white"} ${navOpen ? "-rotate-45 -translate-y-1.5" : ""}`}></div>
          </button>
        </div>

        {/* Mobile Menu */}
        {navOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
            {[
              { label: "Features", ref: featuresRef },
              { label: "About", ref: aboutRef },
              { label: "Pricing", ref: pricingRef },
              { label: "Contact", ref: contactRef },
            ].map((item) => (
              <button key={item.label} onClick={() => scrollTo(item.ref)}
                className="block w-full text-left text-gray-700 font-medium py-2 hover:text-black transition-colors">
                {item.label}
              </button>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={() => (window.location.hash = "login")}
                className="flex-1 border border-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-lg">
                Sign In
              </button>
              <button onClick={() => (window.location.hash = "signup")}
                className="flex-1 bg-black text-white text-sm font-medium py-2.5 rounded-lg">
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ── FULL-SCREEN HERO CAROUSEL ── */}
      <section className="relative w-full h-screen overflow-hidden">
        {SLIDES.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === currentSlide ? "opacity-100" : "opacity-0"}`}
          >
            <img src={slide.img} alt={slide.tag} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
          </div>
        ))}

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-20 lg:px-32">
          <div className="max-w-3xl">
            <span className="inline-block text-xs font-bold uppercase tracking-[3px] text-white/60 mb-6 border border-white/20 px-3 py-1 rounded-full">
              {SLIDES[currentSlide].tag}
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-none mb-6 whitespace-pre-line">
              {SLIDES[currentSlide].title}
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-xl mb-10 font-light leading-relaxed">
              {SLIDES[currentSlide].sub}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => (window.location.hash = "signup")}
                className="bg-white text-black font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all transform hover:-translate-y-0.5 text-sm tracking-wide">
                START FOR FREE
              </button>
              <button onClick={() => scrollTo(featuresRef)}
                className="border border-white/30 text-white font-medium px-8 py-4 rounded-xl hover:bg-white/10 transition-all text-sm tracking-wide backdrop-blur-sm">
                EXPLORE FEATURES
              </button>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`transition-all rounded-full ${i === currentSlide ? "w-8 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/70"}`}
            />
          ))}
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 right-8 text-white/40 text-xs font-medium tracking-widest uppercase animate-bounce">
          Scroll ↓
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="bg-black text-white py-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { val: "10K+", label: "Active Users" },
            { val: "500+", label: "Teams Tracked" },
            { val: "99.9%", label: "Uptime SLA" },
            { val: "4.9★", label: "User Rating" },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-4xl font-black mb-2">{s.val}</div>
              <div className="text-gray-400 text-sm font-medium uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section ref={featuresRef} className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="text-xs font-bold uppercase tracking-[4px] text-gray-400">What We Offer</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mt-4 mb-6">Everything your team needs.</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">A complete productivity operating system — from time tracking to team management, built for the remote-first world.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: "⏱️", title: "Time Tracking", desc: "Automatic time logging with Pomodoro timers and focus sessions. Know exactly where every minute goes." },
              { icon: "📸", title: "Screenshot Monitor", desc: "Periodic screen captures uploaded securely to Cloudinary. Full activity transparency for managers." },
              { icon: "✅", title: "Task Management", desc: "Assign, track, and complete tasks with priority levels, due dates, and real-time status updates." },
              { icon: "📊", title: "Analytics Dashboard", desc: "Beautiful charts showing productivity trends, focus time, team performance, and completion rates." },
              { icon: "🔒", title: "OTP Verification", desc: "Secure email-based one-time password verification powered by Brevo API for all registrations." },
              { icon: "👥", title: "Team Management", desc: "Invite team members, manage approvals, send announcements, and track individual performance." },
            ].map((f, i) => (
              <div key={i} className="group p-8 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="text-4xl mb-5">{f.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT US ── */}
      <section ref={aboutRef} className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center mb-24">
            <div>
              <span className="text-xs font-bold uppercase tracking-[4px] text-gray-400">Our Story</span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter mt-4 mb-6">Built for the way we work now.</h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-6">
                Remote Tracker was born from a simple frustration: managing distributed teams with fragmented tools. We built the platform we wished we had — a single, beautiful, and powerful system for remote productivity.
              </p>
              <p className="text-gray-500 text-lg leading-relaxed mb-8">
                Every feature is designed with two principles: simplicity for the individual, power for the manager. Whether you're tracking a solo contractor or a 50-person distributed engineering team, Remote Tracker scales with you.
              </p>
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white font-black text-sm">RT</div>
                <div>
                  <p className="font-bold text-gray-900">Remote Tracker Inc.</p>
                  <p className="text-sm text-gray-500">Founded 2024 · Remote-first company</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: "Mission", text: "Empower remote teams to do their best work through transparency and intelligent tooling." },
                { label: "Vision", text: "A world where geography is never a barrier to high-performance collaboration." },
                { label: "Values", text: "Transparency, accountability, deep work, and relentless user focus." },
                { label: "Technology", text: "MERN stack, Cloudinary, Brevo, MongoDB Atlas — built to scale from day one." },
              ].map((item, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100">
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">{item.label}</div>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Team */}
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900">Meet the Team</h3>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {TEAM.map((member, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 text-center border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  {member.avatar}
                </div>
                <p className="font-bold text-gray-900">{member.name}</p>
                <p className="text-sm text-gray-500 mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section ref={pricingRef} className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="text-xs font-bold uppercase tracking-[4px] text-gray-400">Pricing</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mt-4 mb-4">Simple, transparent pricing.</h2>
            <p className="text-gray-500 text-lg">No hidden fees. Cancel anytime.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: "STARTER", price: "$0", period: "Forever free", desc: "Perfect for individuals and small teams getting started.", features: ["Up to 3 team members", "Basic time tracking", "Task management", "5GB screenshot storage"], cta: "Start Free", featured: false },
              { name: "PROFESSIONAL", price: "$19", period: "per month", desc: "For growing remote teams that need the full suite.", features: ["Unlimited team members", "Advanced analytics", "Screenshot monitoring", "Brevo email OTPs", "Cloudinary storage", "Priority support"], cta: "Start Trial", featured: true },
              { name: "ENTERPRISE", price: "$49", period: "per month", desc: "Custom solutions for large organizations.", features: ["Everything in Pro", "Dedicated support", "Custom integrations", "SLA guarantee", "White labeling", "SSO & advanced auth"], cta: "Contact Sales", featured: false },
            ].map((plan, i) => (
              <div key={i} className={`rounded-2xl p-8 relative ${plan.featured ? "bg-black text-white shadow-2xl scale-105" : "bg-white border border-gray-200"}`}>
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <h3 className={`text-xs font-bold uppercase tracking-[3px] mb-3 ${plan.featured ? "text-gray-400" : "text-gray-400"}`}>{plan.name}</h3>
                <div className={`text-5xl font-black mb-1 ${plan.featured ? "text-white" : "text-gray-900"}`}>{plan.price}</div>
                <div className={`text-sm mb-4 ${plan.featured ? "text-gray-400" : "text-gray-500"}`}>{plan.period}</div>
                <p className={`text-sm mb-8 leading-relaxed ${plan.featured ? "text-gray-300" : "text-gray-500"}`}>{plan.desc}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className={`flex items-center gap-2.5 text-sm ${plan.featured ? "text-gray-300" : "text-gray-600"}`}>
                      <span className={`font-bold ${plan.featured ? "text-white" : "text-black"}`}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => (window.location.hash = "signup")}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${plan.featured ? "bg-white text-black hover:bg-gray-100" : "bg-black text-white hover:bg-gray-800"}`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-black text-center tracking-tighter mb-12">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <button
                  className="w-full text-left px-6 py-5 flex items-center justify-between font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                >
                  {faq.q}
                  <span className={`text-xl transition-transform ml-4 ${activeFaq === i ? "rotate-45" : ""}`}>+</span>
                </button>
                {activeFaq === i && (
                  <div className="px-6 pb-5 text-gray-500 text-sm leading-relaxed border-t border-gray-50 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section ref={contactRef} className="py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-20">
          <div>
            <span className="text-xs font-bold uppercase tracking-[4px] text-gray-400">Get In Touch</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mt-4 mb-6">We'd love to hear from you.</h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-10">
              Whether you have a question about features, pricing, enterprise plans, or anything else — our team is ready to answer all your questions.
            </p>
            <div className="space-y-5">
              {[
                { icon: "📧", label: "Email Us", val: "hello@remotetracker.app" },
                { icon: "💬", label: "Live Chat", val: "Available Mon–Fri, 9am–6pm IST" },
                { icon: "📍", label: "Location", val: "Remote-first · India" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-lg">{item.icon}</div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{item.label}</p>
                    <p className="text-gray-700 font-medium text-sm">{item.val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleContact} className="space-y-5">
            {contactSent && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-xl text-sm font-medium">
                ✅ Message sent! We'll get back to you within 24 hours.
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Name</label>
                <input type="text" required value={contactForm.name}
                  onChange={e => setContactForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Your name"
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input type="email" required value={contactForm.email}
                  onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all text-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Message</label>
              <textarea required value={contactForm.message}
                onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))}
                rows={6} placeholder="Tell us what's on your mind..."
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all text-sm resize-none" />
            </div>
            <button type="submit"
              className="w-full bg-black text-white py-4 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all transform hover:-translate-y-0.5">
              SEND MESSAGE →
            </button>
          </form>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-black text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                  <span className="text-black font-black text-sm">RT</span>
                </div>
                <span className="font-bold text-xl">Remote Tracker</span>
              </div>
              <p className="text-gray-400 font-light leading-relaxed max-w-sm">
                The all-in-one productivity platform for remote teams. Track time, monitor activity, and grow together.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-[3px] text-gray-500 mb-6">Product</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                {["Features", "Pricing", "Security", "Changelog"].map(l => (
                  <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-[3px] text-gray-500 mb-6">Company</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                {["About Us", "Blog", "Careers", "Privacy Policy", "Terms of Service"].map(l => (
                  <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Remote Tracker Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
