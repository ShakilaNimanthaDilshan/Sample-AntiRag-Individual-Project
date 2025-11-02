// client/src/pages/TermsAndConditions.jsx
import React from 'react';
import { Link as RouterLink } from 'react-router-dom'; // Use RouterLink
import {
  Container,
  Typography,
  Box,
  Link as MuiLink,
} from '@mui/material';

export default function TermsAndConditions() {
  // A helper component for consistent section headings
  const SectionHeader = ({ children }) => (
    <Typography
      variant="h5"
      component="h2"
      sx={{
        borderBottom: '2px solid #eee',
        paddingBottom: '10px',
        marginTop: '40px',
        marginBottom: '20px',
      }}
    >
      {children}
    </Typography>
  );

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Terms and Conditions of Use
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Last Updated: {new Date().toLocaleDateString()}
      </Typography>
      <Typography variant="body1" paragraph>
        Please read these Terms and Conditions ("Terms") carefully before using
        this platform (the "Service") operated by the platform administrators
        ("us", "we", or "our").
      </Typography>
      <Typography variant="body1" paragraph>
        Your access to and use of the Service is conditioned on your acceptance
        of and compliance with these Terms. These Terms apply to all visitors,
        users, and others who access or use the Service.
      </Typography>

      <SectionHeader>1. Acceptance of Terms</SectionHeader>
      <Typography variant="body1" paragraph>
        By registering for or using the Service, you agree to be bound by these
        Terms. If you disagree with any part of the terms, you may not access
        the Service.
      </Typography>

      <SectionHeader>2. User Accounts</SectionHeader>
      <Typography variant="body1" paragraph>
        You are responsible for safeguarding the password that you use to access
        the Service and for any activities or actions under your password. You
        agree not to disclose your password to any third party. You must notify
        us immediately upon becoming aware of any breach of security or
        unauthorized use of your account.
      </Typography>

      <SectionHeader>3. User-Generated Content (UGC)</SectionHeader>
      <Typography variant="body1" paragraph>
        Our Service allows you to post reports, comments, replies, and other
        content ("Content"). You are solely responsible for the Content you
        post, including its legality, reliability, and appropriateness.
      </Typography>
      <ul>
        <li>
          By posting Content, you represent that it is truthful to the best of
          your knowledge.
        </li>
        <li>
          You retain all of your rights to any Content you submit. By posting
          it, you grant us a non-exclusive, worldwide, royalty-free, perpetual
          license to use, display, reproduce, and distribute such Content on and
          through the Service.
        </li>
        <li>
          We take no responsibility and assume no liability for Content posted
          by you or any third party.
        </li>
      </ul>

      <SectionHeader>4. Content Moderation</SectionHeader>
      <Typography variant="body1" paragraph>
        We reserve the right, but not the obligation, to monitor, edit, or
        remove Content that we determine, in our sole discretion, to be
        unlawful, offensive, threatening, libelous, defamatory, obscene, or
        otherwise objectionable or in violation of these Terms.
      </Typography>
      <Typography variant="body1" paragraph>
        We have the right to:
      </Typography>
      <ul>
        <li>
          Remove or refuse to post any Content for any or no reason.
        </li>
        <li>
          Take any action with respect to any Content that we deem necessary or
          appropriate, including if we believe it violates the Terms or could
          create liability for us.
        </li>
        <li>
          Disclose your identity or other information about you to any third
          party who claims that material posted by you violates their rights,
          including their intellectual property rights or their right to
          privacy.
        </li>
        <li>
          Take appropriate legal action, including referral to law enforcement,
          for any illegal or unauthorized use of the Service.
        </li>
      </ul>

      <SectionHeader>5. Prohibited Uses</SectionHeader>
      <Typography variant="body1" paragraph>
        You may not use the Service:
      </Typography>
      <ul>
        <li>
          In any way that violates any applicable local, national, or
          international law or regulation (including, without limitation, any
          laws regarding the export of data or software to and from Sri Lanka
          or other countries).
        </li>
        <li>
          To post any content that is knowingly false, malicious, or
          defamatory.
        </li>
        <li>
          To impersonate or attempt to impersonate another user or any other
          person or entity.
        </li>
        <li>
          To engage in any other conduct that restricts or inhibits anyone's
          use or enjoyment of the Service.
        </li>
      </ul>

      <SectionHeader>6. Disclaimer: This is Not an Emergency Service</SectionHeader>
      <Typography variant="body1" paragraph
        sx={{
          background: '#fff0f0',
          border: '1px solid #fcc',
          borderRadius: '4px',
          padding: '16px',
          fontWeight: 'bold'
        }}
      >
        This platform is not a substitute for contacting emergency services or
        university authorities. If you are in immediate danger or witness a
        crime in progress, you must contact the police (119) or your
        university's security services immediately. We do not monitor
        submissions in real-time and cannot guarantee a timely response.
      </Typography>

      <SectionHeader>7. Anonymity</SectionHeader>
      <Typography variant="body1" paragraph>
        If you post "anonymously," we will not display your name on the public
        post. However, your account information is still stored in our
        database and linked to your post. Anonymity is not absolute and may be
        broken if required by law or a valid legal order.
      </Typography>

      <SectionHeader>8. Limitation of Liability</SectionHeader>
      <Typography variant="body1" paragraph>
        In no event shall the platform administrators be liable for any
        indirect, incidental, special, consequential, or punitive damages,
        including without limitation, loss of profits, data, use, goodwill, or
        other intangible losses, resulting from your access to or use of the
        Service or any Content on the Service.
      </Typography>

      <SectionHeader>9. Termination</SectionHeader>
      <Typography variant="body1" paragraph>
        We may terminate or suspend your account immediately, without prior
        notice or liability, for any reason whatsoever, including without
        limitation if you breach the Terms.
      </Typography>

      <SectionHeader>10. Governing Law</SectionHeader>
      <Typography variant="body1" paragraph>
        These Terms shall be governed and construed in accordance with the laws
        of Sri Lanka, without regard to its conflict of law provisions.
      </Typography>

      <SectionHeader>11. Changes to Terms</SectionHeader>
      <Typography variant="body1" paragraph>
        We reserve the right, at our sole discretion, to modify or replace
        these Terms at any time. We will try to provide at least 30 days'
        notice prior to any new terms taking effect. By continuing to access or
        use our Service after those revisions become effective, you agree to be
        bound by the revised terms.
      </Typography>
      
      <Typography variant="body1" paragraph sx={{ mt: 4 }}>
        If you have any questions about these Terms, please contact us.
      </Typography>
      
      <MuiLink component={RouterLink} to="/register">
        Back to Registration
      </MuiLink>
    </Container>
  );
}