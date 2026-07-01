import './css/DeviceContractPage.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdCheckCircle, MdLocalShipping, MdVerifiedUser } from 'react-icons/md';
import { BsFillCameraVideoFill } from 'react-icons/bs';
import { FaSimCard } from 'react-icons/fa';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const MOCK = {
  device: {
    name: 'Apple iPhone 17 256GB 5G',
    colours: [
      { name: 'Lavender', hex: '#c8b8e8' },
      { name: 'Sky Blue',  hex: '#a8c8d8' },
      { name: 'Desert',   hex: '#b8a888' },
      { name: 'Midnight', hex: '#1c1c1e' },
      { name: 'White',    hex: '#f5f5f0' },
    ],
  },
  plan: {
    name: 'RED Core 3GB 100min',
    features: [
      { label: '3GB Anytime data' },
      { label: '100 minutes' },
      { label: '150 SMS' },
    ],
  },
  includes: [
    { Icon: MdVerifiedUser,       label: 'Free 1-Year Extended Warranty' },
    { Icon: BsFillCameraVideoFill, label: 'Bonus Video Ticket 1GB 3 Months' },
    { Icon: FaSimCard,            label: 'Promotional 30GB – 30 days' },
  ],
  duration: { months: 36, pricePerMonth: 799 },
  delivery: { fee: 79 },
};

export default function DeviceContractPage() {
  const navigate = useNavigate();
  const [appType, setAppType] = useState('new');
  const [colour, setColour] = useState(MOCK.device.colours[0].name);

  const selectedColour = MOCK.device.colours.find((c) => c.name === colour);
  const { duration, delivery } = MOCK;
  const monthlyTotal = duration.pricePerMonth;

  return (
    <div className="dcp">
      <Header />

      <div className="dcp__inner">
        <button className="dcp__back" onClick={() => navigate(-1)}>
          <MdArrowBack /> Back
        </button>

        <h1 className="dcp__page-title">Deal details</h1>

        <div className="dcp__steps">

          {/* ── Step 1 ── */}
          <div className="dcp__step">
            <div className="dcp__step-rail">
              <span className="dcp__step-num">1</span>
              <span className="dcp__step-line" />
            </div>
            <div className="dcp__step-body">
              <h2 className="dcp__step-title">Confirm your application type</h2>
              <div className="dcp__app-type-btns">
                <button
                  className={`dcp__type-btn${appType === 'new' ? ' dcp__type-btn--active' : ''}`}
                  onClick={() => setAppType('new')}
                >
                  New Contract
                  {appType === 'new' && <MdCheckCircle className="dcp__type-check" />}
                </button>
                <button
                  className={`dcp__type-btn${appType === 'upgrade' ? ' dcp__type-btn--active' : ''}`}
                  onClick={() => setAppType('upgrade')}
                >
                  Upgrade
                  {appType === 'upgrade' && <MdCheckCircle className="dcp__type-check" />}
                </button>
              </div>
            </div>
          </div>

          {/* ── Step 2 ── */}
          <div className="dcp__step">
            <div className="dcp__step-rail">
              <span className="dcp__step-num">2</span>
              <span className="dcp__step-line" />
            </div>
            <div className="dcp__step-body">
              <h2 className="dcp__step-title">Review your selected deal</h2>

              <div className="dcp__deal-card">
                <p className="dcp__deal-card-name">{MOCK.device.name}</p>
                <div className="dcp__deal-cols">

                  {/* Device column */}
                  <div className="dcp__deal-col">
                    <p className="dcp__col-label">Device:</p>
                    <div className="dcp__device-row">
                      <div className="dcp__device-thumb" style={{ background: selectedColour.hex }} />
                      <span className="dcp__device-name">{MOCK.device.name}</span>
                    </div>
                    <p className="dcp__colour-label">
                      Choose a colour: <strong>{colour}</strong>
                    </p>
                    <div className="dcp__colour-swatches">
                      {MOCK.device.colours.map((c) => (
                        <button
                          key={c.name}
                          className={`dcp__swatch${colour === c.name ? ' dcp__swatch--active' : ''}`}
                          style={{ background: c.hex }}
                          onClick={() => setColour(c.name)}
                          aria-label={c.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Plan column */}
                  <div className="dcp__deal-col">
                    <p className="dcp__col-label">Plan:</p>
                    <p className="dcp__plan-name">{MOCK.plan.name}</p>
                    <ul className="dcp__plan-features">
                      {MOCK.plan.features.map((f) => (
                        <li key={f.label} className="dcp__plan-feature">
                          <span className="dcp__feature-dot" />
                          {f.label}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Includes column */}
                  <div className="dcp__deal-col">
                    <p className="dcp__col-label">Also includes:</p>
                    <ul className="dcp__includes">
                      {MOCK.includes.map((item, i) => (
                        <li key={i} className="dcp__include-item">
                          <span className="dcp__include-icon"><item.Icon /></span>
                          <span className="dcp__include-label">{item.label}</span>
                          {i < MOCK.includes.length - 1 && <span className="dcp__include-plus">+</span>}
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>

            </div>
          </div>

          {/* ── Duration checkpoint (hollow circle) ── */}
          <div className="dcp__step">
            <div className="dcp__step-rail">
              <span className="dcp__step-num dcp__step-num--hollow" />
              <span className="dcp__step-line" />
            </div>
            <div className="dcp__step-body">
              {/* Duration picker */}
              <div className="dcp__duration-section">
                <p className="dcp__duration-label">Choose the duration &amp; price:</p>
                <div className="dcp__duration-pill dcp__duration-pill--active">
                  <span>x{duration.months} months</span>
                  <span>R{duration.pricePerMonth} PM</span>
                  <MdCheckCircle className="dcp__duration-check" />
                </div>
              </div>

              {/* Availability + delivery */}
              <div className="dcp__available-badge">
                <MdCheckCircle className="dcp__available-icon" /> Available online
              </div>

              <div className="dcp__delivery-box">
                <p className="dcp__delivery-heading">
                  <MdLocalShipping /> Delivery in 5 – 7 working days
                </p>
                <p className="dcp__delivery-line">
                  Flat fee of R{delivery.fee} for delivery anywhere in SA
                </p>
                <p className="dcp__delivery-line dcp__delivery-link">Track your order online</p>
                <p className="dcp__delivery-line">
                  Stay updated on your order's journey with real-time tracking
                </p>
                <p className="dcp__delivery-line dcp__delivery-link">Hassle-free returns</p>
                <p className="dcp__delivery-line">
                  You can return products bought once-off or on contract within 7 days
                </p>
                <p className="dcp__delivery-line dcp__delivery-link">See our delivery &amp; returns policy</p>
              </div>
            </div>
          </div>

          {/* ── Step 3 ── */}
          <div className="dcp__step">
            <div className="dcp__step-rail">
              <span className="dcp__step-num">3</span>
            </div>
            <div className="dcp__step-body">
              <h2 className="dcp__step-title">Review contract &amp; add to your wishlist</h2>

              <div className="dcp__summary-table">
                <div className="dcp__summary-row">
                  <span className="dcp__summary-key">Application type</span>
                  <span className="dcp__summary-val">
                    {appType === 'new' ? 'New contract' : 'Upgrade'}
                  </span>
                </div>
                <div className="dcp__summary-row">
                  <span className="dcp__summary-key">Contract duration</span>
                  <span className="dcp__summary-val">{duration.months} months</span>
                </div>
                <div className="dcp__summary-divider" />
                <div className="dcp__summary-row">
                  <span className="dcp__summary-key dcp__summary-key--bold">Deal</span>
                </div>
                <div className="dcp__summary-row">
                  <span className="dcp__summary-key">{MOCK.device.name}</span>
                  <span className="dcp__summary-val">R{monthlyTotal}.00 PM</span>
                </div>
                <div className="dcp__summary-divider" />
                <div className="dcp__summary-row">
                  <span className="dcp__summary-key dcp__summary-key--bold">Delivery</span>
                </div>
                <div className="dcp__summary-row">
                  <span className="dcp__summary-key dcp__summary-key--muted">
                    Standard once-off delivery fee. This will be added to your first month's bill
                  </span>
                  <span className="dcp__summary-val">R{delivery.fee}.00</span>
                </div>
                <div className="dcp__summary-divider" />
                <div className="dcp__summary-row dcp__summary-row--total">
                  <span className="dcp__summary-key">Monthly total:</span>
                  <span className="dcp__summary-val">
                    R{monthlyTotal}.00 PM x {duration.months}
                  </span>
                </div>
              </div>

              <button className="dcp__get-deal-btn">Get this deal</button>
            </div>
          </div>

        </div>
      </div>

      <BottomNav />
    </div>
  );
}
