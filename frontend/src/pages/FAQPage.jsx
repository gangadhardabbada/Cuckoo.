import { useState } from 'react';
import './FAQPage.css';

export default function FAQPage() {
  const faqs = [
    {
      q: 'How do I connect WhatsApp?',
      a: 'Navigate to the Broadcast tab. If you are using WhatsApp Web, click "Reveal QR" and scan the generated QR code with your phone\'s WhatsApp application (Menu ⋮ → Linked Devices → Link a Device). If you are using the Cloud API, enter your Phone Number ID, WhatsApp Business Account ID, and Access Token, then click Save & Connect.',
    },
    {
      q: 'How many messages can I send?',
      a: 'For WhatsApp Web sessions, we recommend a sending delay of 3–5 seconds between messages to stay within safe usage patterns. For high-volume campaigns, we support the official WhatsApp Cloud API, which allows sending thousands of messages per day without session constraints, adhering to your WhatsApp Business level tier limits.',
    },
    {
      q: 'How does Cloud API work?',
      a: 'The official WhatsApp Cloud API connects directly to Meta servers using API keys and templates. It does not require a physical phone to remain online. You will need a verified Meta Developer Account, a business phone number, and a permanent System User Token to send official template and session broadcasts.',
    },
    {
      q: 'Why did my message fail?',
      a: 'Message delivery failures usually occur because: (1) the recipient number is not active on WhatsApp, (2) the format lacks a proper country code, (3) your WhatsApp Web device went offline or lost connectivity, or (4) you hit Meta rate limits when using the Cloud API. Check your campaign logs tab for the specific error codes.',
    },
    {
      q: 'How are contacts imported?',
      a: 'You can upload CSV, XLSX, or XLS spreadsheets. Our Smart Discovery engine analyzes the document, detects name and phone columns automatically, removes duplicates, filters invalid formatting, and segments contacts into groups (e.g., Leaders vs Members). You can review lists in detail before importing.',
    },
  ];

  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      <div className="page-header">
        <h1>Workspace Support & FAQs</h1>
        <p>Answers to common questions about connecting accounts, importing lists, and broadcasting limits</p>
      </div>

      <div className="faq-container">
        {faqs.map((faq, idx) => {
          const isOpen = activeIndex === idx;
          return (
            <div key={idx} className={`faq-card ${isOpen ? 'open' : ''}`} onClick={() => toggleFAQ(idx)}>
              <div className="faq-header-row">
                <span className="faq-question">{faq.q}</span>
                <span className="faq-arrow">{isOpen ? '▼' : '▶'}</span>
              </div>
              {isOpen && (
                <div className="faq-answer">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
