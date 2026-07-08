import './css/ShareModal.css';
import { useState } from 'react';
import { MdClose, MdContentCopy, MdCheck } from 'react-icons/md';
import { FaWhatsapp, FaFacebook, FaXTwitter, FaLinkedin, FaEnvelope, FaDiscord } from 'react-icons/fa6';

function ShareModal({ title, url, onClose }) {
  const [copied, setCopied] = useState(false);
  const [discordCopied, setDiscordCopied] = useState(false);

  const shareText = `Check out ${title} on InsureTech Guard!`;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(shareText);

  const options = [
    {
      name: 'WhatsApp',
      className: 'whatsapp',
      icon: <FaWhatsapp />,
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    },
    {
      name: 'Facebook',
      className: 'facebook',
      icon: <FaFacebook />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: 'X',
      className: 'twitter',
      icon: <FaXTwitter />,
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      name: 'LinkedIn',
      className: 'linkedin',
      icon: <FaLinkedin />,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: 'Email',
      className: 'email',
      icon: <FaEnvelope />,
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodedText}%20${encodedUrl}`,
    },
    {
      name: discordCopied ? 'Copied!' : 'Discord',
      className: 'discord',
      icon: discordCopied ? <MdCheck /> : <FaDiscord />,
      onClick: handleDiscordShare,
    },
  ];

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDiscordShare() {
    await navigator.clipboard.writeText(`${shareText} ${url}`);
    setDiscordCopied(true);
    setTimeout(() => setDiscordCopied(false), 2000);

    let appOpened = false;
    const markOpened = () => { appOpened = true; };
    window.addEventListener('blur', markOpened, { once: true });
    document.addEventListener('visibilitychange', markOpened, { once: true });

    window.location.href = 'discord://discord.com/app';

    setTimeout(() => {
      window.removeEventListener('blur', markOpened);
      document.removeEventListener('visibilitychange', markOpened);
      if (!appOpened) {
        window.open('https://discord.com/app', '_blank', 'noopener,noreferrer');
      }
    }, 1200);
  }

  return (
    <div
      className="share-modal__overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Share product"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="share-modal__content">
        <div className="share-modal__header">
          <h3>Share this product</h3>
          <button className="share-modal__close" onClick={onClose} aria-label="Close">
            <MdClose />
          </button>
        </div>

        <div className="share-modal__grid">
          {options.map((option) =>
            option.onClick ? (
              <button
                key={option.className}
                type="button"
                className={`share-modal__option share-modal__option--${option.className}`}
                onClick={option.onClick}
              >
                <span className="share-modal__icon">{option.icon}</span>
                <span>{option.name}</span>
              </button>
            ) : (
              <a
                key={option.className}
                className={`share-modal__option share-modal__option--${option.className}`}
                href={option.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="share-modal__icon">{option.icon}</span>
                <span>{option.name}</span>
              </a>
            )
          )}
        </div>

        <div className="share-modal__link-row">
          <span className="share-modal__url">{url}</span>
          <button
            className={`share-modal__copy${copied ? ' copied' : ''}`}
            onClick={handleCopy}
          >
            {copied ? <MdCheck /> : <MdContentCopy />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;
