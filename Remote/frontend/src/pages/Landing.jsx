import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "./Landing.css";

const Landing = () => {
  const { login } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Sliding images data
  const slides = [
    {
      id: 1,
      title: "Dashboard Overview",
      description: "Get a complete view of your team's productivity with real-time analytics",
      image: "📊",
      color: "#4f46e5"
    },
    {
      id: 2,
      title: "Task Management",
      description: "Organize and track tasks with our intuitive drag-and-drop interface",
      image: "📋",
      color: "#059669"
    },
    {
      id: 3,
      title: "Time Tracking",
      description: "Monitor work hours and productivity with automated time tracking",
      image: "⏱️",
      color: "#dc2626"
    },
    {
      id: 4,
      title: "Team Analytics",
      description: "Analyze team performance with detailed reports and insights",
      image: "📈",
      color: "#7c3aed"
    },
    {
      id: 5,
      title: "Pomodoro Timer",
      description: "Boost focus and productivity with built-in Pomodoro technique",
      image: "🍅",
      color: "#ea580c"
    }
  ];

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Project Manager",
      company: "TechCorp Inc.",
      message: "Team Tracker has revolutionized how we manage our remote team. Productivity is up 40%!",
      avatar: "👩‍💼",
      rating: 5
    },
    {
      id: 2,
      name: "Mike Chen",
      role: "Team Lead",
      company: "StartupXYZ",
      message: "The time tracking and analytics features are game-changers. We can't work without it now.",
      avatar: "👨‍💻",
      rating: 5
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "HR Director",
      company: "GlobalTech",
      message: "Perfect for managing distributed teams. The insights help us support our employees better.",
      avatar: "👩‍🎓",
      rating: 5
    }
  ];

  // Auto-slide functionality
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(slideInterval);
  }, [slides.length]);

  // Auto-testimonial rotation
  useEffect(() => {
    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(testimonialInterval);
  }, [testimonials.length]);

  const handleGetStarted = () => {
    // Navigate to login page by changing the hash
    window.location.hash = "login";
  };

  const handleDemoLogin = async () => {
    try {
      const result = await login("demo@example.com", "Password123");
      if (result.success) {
        window.location.hash = "dashboard";
      }
    } catch (error) {
      console.error("Demo login failed:", error);
    }
  };

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="container">
          <div className="logo">
            <h1>🚀 Team Tracker</h1>
          </div>
          <nav className="nav-buttons">
            <button 
              className="btn btn-outline"
              onClick={handleGetStarted}
            >
              Login
            </button>
          </nav>
        </div>
      </header>

      <main className="landing-main">
        <section className="hero-section">
          <div className="container">
            <div className="hero-content">
              <h1 className="hero-title">
                Remote Team Productivity
                <span className="highlight"> Made Simple</span>
              </h1>
              <p className="hero-description">
                Track time, manage tasks, and boost productivity with our comprehensive 
                remote team management system. Built for modern distributed teams.
              </p>
              <div className="hero-buttons">
                <button 
                  className="btn btn-primary btn-large"
                  onClick={handleGetStarted}
                >
                  Get Started
                </button>
                <button 
                  className="btn btn-secondary btn-large"
                  onClick={handleDemoLogin}
                >
                  Try Demo
                </button>
              </div>
            </div>
            <div className="hero-image">
              <div className="image-slider">
                <div className="slider-container">
                  {slides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className={`slide ${index === currentSlide ? 'active' : ''}`}
                      style={{ backgroundColor: slide.color }}
                    >
                      <div className="slide-content">
                        <div className="slide-icon">{slide.image}</div>
                        <h3 className="slide-title">{slide.title}</h3>
                        <p className="slide-description">{slide.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="slider-dots">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      className={`dot ${index === currentSlide ? 'active' : ''}`}
                      onClick={() => setCurrentSlide(index)}
                    />
                  ))}
                </div>

                <div className="slider-controls">
                  <button
                    className="control-btn prev"
                    onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                  >
                    ‹
                  </button>
                  <button
                    className="control-btn next"
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="features-section">
          <div className="container">
            <h2 className="section-title">Everything You Need</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🍅</div>
                <h3>Pomodoro Timer</h3>
                <p>Built-in focus timer with notifications to boost productivity</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📋</div>
                <h3>Task Management</h3>
                <p>Trello-style drag-and-drop task boards for better organization</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">⏱️</div>
                <h3>Time Tracking</h3>
                <p>Automatic and manual time tracking for accurate reporting</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>Analytics Dashboard</h3>
                <p>Manager view with productivity charts and detailed metrics</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔐</div>
                <h3>Secure Authentication</h3>
                <p>JWT-based auth with role-based access control</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📧</div>
                <h3>Team Communication</h3>
                <p>Email system for announcements and notifications</p>
              </div>
            </div>
          </div>
        </section>

        <section className="testimonials-section">
          <div className="container">
            <h2 className="section-title">What Our Users Say</h2>
            <div className="testimonials-slider">
              <div className="testimonial-container">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={testimonial.id}
                    className={`testimonial ${index === currentTestimonial ? 'active' : ''}`}
                  >
                    <div className="testimonial-content">
                      <div className="stars">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <span key={i} className="star">⭐</span>
                        ))}
                      </div>
                      <p className="testimonial-message">"{testimonial.message}"</p>
                      <div className="testimonial-author">
                        <div className="author-avatar">{testimonial.avatar}</div>
                        <div className="author-info">
                          <h4 className="author-name">{testimonial.name}</h4>
                          <p className="author-role">{testimonial.role} at {testimonial.company}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="testimonial-dots">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`dot ${index === currentTestimonial ? 'active' : ''}`}
                    onClick={() => setCurrentTestimonial(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="stats-section">
          <div className="container">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-number">10,000+</div>
                <div className="stat-label">Active Users</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🏢</div>
                <div className="stat-number">500+</div>
                <div className="stat-label">Companies</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏰</div>
                <div className="stat-number">1M+</div>
                <div className="stat-label">Hours Tracked</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-number">40%</div>
                <div className="stat-label">Productivity Boost</div>
              </div>
            </div>
          </div>
        </section>

        <section className="pricing-section">
          <div className="container">
            <h2 className="section-title">Simple, Transparent Pricing</h2>
            <div className="pricing-grid">
              <div className="pricing-card">
                <div className="pricing-header">
                  <h3>Starter</h3>
                  <div className="price">
                    <span className="currency">$</span>
                    <span className="amount">9</span>
                    <span className="period">/month</span>
                  </div>
                </div>
                <ul className="pricing-features">
                  <li>✅ Up to 5 team members</li>
                  <li>✅ Basic time tracking</li>
                  <li>✅ Task management</li>
                  <li>✅ Email support</li>
                </ul>
                <button className="pricing-btn" onClick={handleGetStarted}>
                  Get Started
                </button>
              </div>

              <div className="pricing-card featured">
                <div className="popular-badge">Most Popular</div>
                <div className="pricing-header">
                  <h3>Professional</h3>
                  <div className="price">
                    <span className="currency">$</span>
                    <span className="amount">19</span>
                    <span className="period">/month</span>
                  </div>
                </div>
                <ul className="pricing-features">
                  <li>✅ Up to 25 team members</li>
                  <li>✅ Advanced analytics</li>
                  <li>✅ Screenshot monitoring</li>
                  <li>✅ Priority support</li>
                  <li>✅ Custom integrations</li>
                </ul>
                <button className="pricing-btn primary" onClick={handleGetStarted}>
                  Start Free Trial
                </button>
              </div>

              <div className="pricing-card">
                <div className="pricing-header">
                  <h3>Enterprise</h3>
                  <div className="price">
                    <span className="currency">$</span>
                    <span className="amount">49</span>
                    <span className="period">/month</span>
                  </div>
                </div>
                <ul className="pricing-features">
                  <li>✅ Unlimited team members</li>
                  <li>✅ Advanced security</li>
                  <li>✅ Custom branding</li>
                  <li>✅ Dedicated support</li>
                  <li>✅ API access</li>
                </ul>
                <button className="pricing-btn" onClick={handleGetStarted}>
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2>Ready to Boost Your Team's Productivity?</h2>
              <p>Join thousands of remote teams already using Team Tracker</p>
              <div className="cta-buttons">
                <button 
                  className="btn btn-primary btn-large"
                  onClick={handleGetStarted}
                >
                  Start Free Trial
                </button>
                <button 
                  className="btn btn-outline btn-large"
                  onClick={handleDemoLogin}
                >
                  View Demo
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>🚀 Team Tracker</h3>
              <p>Remote productivity management made simple</p>
            </div>
            <div className="footer-section">
              <h4>Features</h4>
              <ul>
                <li>Time Tracking</li>
                <li>Task Management</li>
                <li>Team Analytics</li>
                <li>Productivity Reports</li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li>Documentation</li>
                <li>Help Center</li>
                <li>Contact Us</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Team Tracker. Built with ❤️ for remote teams.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
