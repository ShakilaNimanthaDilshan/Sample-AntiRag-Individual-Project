// client/src/pages/TermsAndConditions.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function TermsAndConditions() {
  const pageStyle = {
    maxWidth: '800px',
    margin: '20px auto',
    padding: '20px',
    lineHeight: '1.6',
    fontFamily: 'Arial, sans-serif',
  };
  const h2Style = {
    borderBottom: '2px solid #eee',
    paddingBottom: '10px',
    marginTop: '30px',
  };

  return (
    <div style={pageStyle}>
      <h2>Terms and Conditions of Use</h2>
      <p>Last Updated: {new Date().toLocaleDateString()}</p>
      <p>Please read these Terms and Conditions ("Terms") carefully before using this platform (the "Service") operated by the platform administrators ("us", "we", or "our").</p>
      <p>Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.</p>

      <h3 style={h2Style}>1. Acceptance of Terms</h3>
      <p>By registering for or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the Service.</p>

      <h3 style={h2Style}>2. User Accounts</h3>
      <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>

      <h3 style={h2Style}>3. User-Generated Content (UGC)</h3>
      <p>Our Service allows you to post reports, comments, replies, and other content ("Content"). You are solely responsible for the Content you post, including its legality, reliability, and appropriateness.</p>
      <ul>
        <li>By posting Content, you represent that it is truthful to the best of your knowledge.</li>
        <li>You retain all of your rights to any Content you submit. By posting it, you grant us a non-exclusive, worldwide, royalty-free, perpetual license to use, display, reproduce, and distribute such Content on and through the Service.</li>
        <li>We take no responsibility and assume no liability for Content posted by you or any third party.</li>
      </ul>

      <h3 style={h2Style}>4. Content Moderation</h3>
      <p>We reserve the right, but not the obligation, to monitor, edit, or remove Content that we determine, in our sole discretion, to be unlawful, offensive, threatening, libelous, defamatory, obscene, or otherwise objectionable or in violation of these Terms.</p>
      <p>We have the right to:
        <ul>
          <li>Remove or refuse to post any Content for any or no reason.</li>
          <li>Take any action with respect to any Content that we deem necessary or appropriate, including if we believe it violates the Terms or could create liability for us.</li>
          <li>Disclose your identity or other information about you to any third party who claims that material posted by you violates their rights, including their intellectual property rights or their right to privacy.</li>
          <li>Take appropriate legal action, including referral to law enforcement, for any illegal or unauthorized use of the Service.</li>
        </ul>
      </p>

      <h3 style={h2Style}>5. Prohibited Uses</h3>
      <p>You may not use the Service:
        <ul>
          <li>In any way that violates any applicable local, national, or international law or regulation (including, without limitation, any laws regarding the export of data or software to and from Sri Lanka or other countries).</li>
          <li>To post any content that is knowingly false, malicious, or defamatory.</li>
          <li>To impersonate or attempt to impersonate another user or any other person or entity.</li>
          <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Service.</li>
        </ul>
      </p>

      <h3 style={h2Style}>6. Disclaimer: This is Not an Emergency Service</h3>
      <p>This platform is not a substitute for contacting emergency services or university authorities. If you are in immediate danger or witness a crime in progress, you must contact the police (119) or your university's security services immediately. We do not monitor submissions in real-time and cannot guarantee a timely response.</p>
      
      <h3 style={h2Style}>7. Anonymity</h3>
      <p>If you post "anonymously," we will not display your name on the public post. However, your account information is still stored in our database and linked to your post. Anonymity is not absolute and may be broken if required by law or a valid legal order.</p>

      <h3 style={h2Style}>8. Limitation of Liability</h3>
      <p>In no event shall the platform administrators be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of the Service or any Content on the Service.</p>

      <h3 style={h2Style}>9. Termination</h3>
      <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>

      <h3 style={h2Style}>10. Governing Law</h3>
      <p>These Terms shall be governed and construed in accordance with the laws of Sri Lanka, without regard to its conflict of law provisions.</p>

      <h3 style={h2Style}>11. Changes to Terms</h3>
      <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will try to provide at least 30 days' notice prior to any new terms taking effect. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.</p>
      
      <p>If you have any questions about these Terms, please contact us.</p>
      <br />
      <Link to="/register">Back to Registration</Link>
    </div>
  );
}