import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    navigate(isAuthenticated ? '/dashboard' : '/auth');
  };

  return (
    <div className="landing">
      {/* Animated background */}
      <div className="landing-bg">
        <div className="landing-orb landing-orb-1" />
        <div className="landing-orb landing-orb-2" />
        <div className="landing-orb landing-orb-3" />
      </div>

      {/* Header */}
      <header className="landing-header">
        <div className="landing-brand">
          <img src="/logo.png" className="landing-brand-logo" alt="Cuckoo logo" style={{ height: '32px', width: '32px', objectFit: 'contain' }} />
          <span className="landing-brand-name">Cuckoo</span>
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleGetStarted}>
          {isAuthenticated ? 'Home' : 'Get Started'}
        </button>
      </header>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-badge">
          <span className="badge badge-whatsapp">🟢 WhatsApp Business API</span>
        </div>
        <h1 className="landing-hero-title">
          Private WhatsApp<br />
          <span className="gradient-text">Broadcasting</span> Platform
        </h1>
        <p className="landing-hero-description">
          Send personalized, private WhatsApp messages to hundreds of contacts at once.
          No groups. No exposure. Each recipient gets a personal 1-to-1 message.
        </p>
        <div className="landing-hero-actions">
          <button className="btn btn-primary btn-lg" onClick={handleGetStarted}>
            Start Broadcasting →
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
            Learn More
          </button>
        </div>

        {/* Stats */}
        <div className="landing-stats">
          <div className="landing-stat">
            <div className="landing-stat-value">1-to-1</div>
            <div className="landing-stat-label">Private Messages</div>
          </div>
          <div className="landing-stat-divider" />
          <div className="landing-stat">
            <div className="landing-stat-value">CSV</div>
            <div className="landing-stat-label">Bulk Upload</div>
          </div>
          <div className="landing-stat-divider" />
          <div className="landing-stat">
            <div className="landing-stat-value">100%</div>
            <div className="landing-stat-label">Privacy</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features" id="features">
        <h2 className="landing-section-title">
          Why Use <span className="gradient-text">Cuckoo</span>?
        </h2>
        <p className="landing-section-sub">
          Stop exposing your contacts in messy group chats. Send professional, private messages at scale.
        </p>

        <div className="landing-features-grid">
          <div className="landing-feature-card">
            <div className="landing-feature-icon" style={{ background: 'rgba(99,102,241,0.12)' }}>🔒</div>
            <h3>Complete Privacy</h3>
            <p>Recipients never see each other's numbers. Each message is a private 1-to-1 conversation.</p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-icon" style={{ background: 'rgba(37,211,102,0.12)' }}>📤</div>
            <h3>Bulk CSV Upload</h3>
            <p>Upload your contact list as CSV. System validates phone numbers, detects duplicates, and flags errors.</p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-icon" style={{ background: 'rgba(245,158,11,0.12)' }}>📊</div>
            <h3>Real-time Tracking</h3>
            <p>Monitor delivery status in real-time. See which messages were sent, delivered, or failed.</p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-icon" style={{ background: 'rgba(239,68,68,0.12)' }}>⚡</div>
            <h3>Lightning Fast</h3>
            <p>Send hundreds of messages simultaneously. No more tedious manual copy-paste-send loops.</p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-icon" style={{ background: 'rgba(59,130,246,0.12)' }}>✅</div>
            <h3>Smart Validation</h3>
            <p>Automatic phone number validation, formatting, and deduplication before sending.</p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-icon" style={{ background: 'rgba(168,85,247,0.12)' }}>🛡️</div>
            <h3>Secure & Reliable</h3>
            <p>Built on WhatsApp Business API with end-to-end encryption. Your data stays safe.</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="landing-steps">
        <h2 className="landing-section-title">
          How It <span className="gradient-text">Works</span>
        </h2>

        <div className="landing-steps-grid">
          <div className="landing-step">
            <div className="landing-step-number">01</div>
            <h3>Sign Up</h3>
            <p>Register with your email or phone. Verify with a quick OTP.</p>
          </div>
          <div className="landing-step-arrow">→</div>
          <div className="landing-step">
            <div className="landing-step-number">02</div>
            <h3>Upload Contacts</h3>
            <p>Upload your CSV file. We validate and clean your contact list automatically.</p>
          </div>
          <div className="landing-step-arrow">→</div>
          <div className="landing-step">
            <div className="landing-step-number">03</div>
            <h3>Compose & Send</h3>
            <p>Write your message and hit send. Each contact gets a private WhatsApp message.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <div className="landing-cta-card">
          <h2>Ready to start broadcasting?</h2>
          <p>Join businesses that send private, professional WhatsApp messages at scale.</p>
          <button className="btn btn-primary btn-lg" onClick={handleGetStarted}>
            Get Started Free →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026 Cuckoo. Built with ❤️ for private messaging.</p>
      </footer>
    </div>
  );
}
